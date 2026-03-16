import db from '../config/database';
import { IProduct, IProductImage, IProductAttribute, IProductVariant, ProductFilterQuery } from '../types';
import { slugify, parsePagination } from '../utils/helpers';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { RowDataPacket } from 'mysql2/promise';

interface CountResult extends RowDataPacket {
  total: number;
}

class ProductService {
  // Get all products with filters and pagination
  async getAll(filters: ProductFilterQuery) {
    const { page, limit, offset, sortBy, sortOrder } = parsePagination(filters);

    // Allowed sortBy columns to prevent SQL injection
    const allowedSortColumns = ['created_at', 'price', 'name', 'view_count'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';

    let whereClause = 'WHERE p.is_active = TRUE';
    const params: unknown[] = [];

    if (filters.search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.category) {
      // Include products in the selected category AND its subcategories
      whereClause += ' AND pc.category_id IN (SELECT id FROM categories WHERE id = ? OR parent_id = ?)';
      params.push(filters.category, filters.category);
    }

    if (filters.brand) {
      whereClause += ' AND p.brand_id = ?';
      params.push(filters.brand);
    }

    if (filters.minPrice !== undefined) {
      whereClause += ' AND p.price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      whereClause += ' AND p.price <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.isFeatured !== undefined) {
      whereClause += ' AND p.is_featured = ?';
      params.push(filters.isFeatured);
    }

    if (filters.isNew !== undefined) {
      whereClause += ' AND p.is_new = ?';
      params.push(filters.isNew);
    }

    if (filters.inStock) {
      whereClause += ' AND p.stock_quantity > 0';
    }

    const joinClause = filters.category
      ? 'LEFT JOIN product_categories pc ON p.id = pc.product_id'
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM products p ${joinClause} ${whereClause}
    `;
    const countResult = await db.queryOne<CountResult>(countQuery, params);
    const total = countResult?.total || 0;

    // Get products
    const query = `
      SELECT DISTINCT p.*, b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as review_count
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ${joinClause}
      ${whereClause}
      ORDER BY p.${safeSortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const products = await db.query<IProduct[]>(query, [...params, limit, offset]);

    return { products, total, page, limit };
  }

  // Get single product by ID or slug
  async getById(id: number) {
    const product = await db.queryOne<IProduct>(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as review_count
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id = ?`,
      [id]
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Get images
    const images = await db.query<IProductImage[]>(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
      [id]
    );

    // Get attributes
    const attributes = await db.query<IProductAttribute[]>(
      'SELECT * FROM product_attributes WHERE product_id = ? ORDER BY display_order',
      [id]
    );

    // Get variants
    const variants = await db.query<IProductVariant[]>(
      'SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE',
      [id]
    );

    // Get categories
    const categories = await db.query<RowDataPacket[]>(
      `SELECT c.id, c.name, c.slug, pc.is_primary 
       FROM categories c
       JOIN product_categories pc ON c.id = pc.category_id
       WHERE pc.product_id = ?`,
      [id]
    );

    // Increment view count
    await db.execute('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [id]);

    return { ...product, images, attributes, variants, categories };
  }

  // Get product by slug
  async getBySlug(slug: string) {
    const product = await db.queryOne<IProduct>(
      'SELECT id FROM products WHERE slug = ? AND is_active = TRUE',
      [slug]
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return this.getById(product.id);
  }

  // Create a product (admin)
  async create(data: {
    name: string;
    description?: string;
    short_description?: string;
    sku: string;
    brand_id?: number;
    price: number;
    discount_price?: number;
    cost_price?: number;
    stock_quantity?: number;
    low_stock_threshold?: number;
    weight?: number;
    dimensions?: string;
    is_featured?: boolean;
    is_new?: boolean;
    categories?: number[];
  }) {
    const slug = slugify(data.name);

    // Check for duplicate slug
    const existingSlug = await db.queryOne<IProduct>(
      'SELECT id FROM products WHERE slug = ?',
      [slug]
    );

    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const result = await db.execute(
      `INSERT INTO products (name, slug, description, short_description, sku, brand_id,
        price, discount_price, cost_price, stock_quantity, low_stock_threshold,
        weight, dimensions, is_featured, is_new)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, finalSlug, data.description || null, data.short_description || null,
        data.sku, data.brand_id || null,
        data.price, data.discount_price || null, data.cost_price || null,
        data.stock_quantity || 0, data.low_stock_threshold || 10,
        data.weight || null, data.dimensions || null,
        data.is_featured || false, data.is_new || false,
      ]
    );

    const productId = result.insertId;

    // Link categories
    if (data.categories && data.categories.length > 0) {
      for (let i = 0; i < data.categories.length; i++) {
        await db.execute(
          'INSERT INTO product_categories (product_id, category_id, is_primary) VALUES (?, ?, ?)',
          [productId, data.categories[i], i === 0]
        );
      }
    }

    return this.getById(productId);
  }

  // Update a product (admin)
  async update(id: number, data: Record<string, unknown>) {
    const product = await db.queryOne<IProduct>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const allowedFields = [
      'name', 'description', 'short_description', 'sku', 'brand_id',
      'price', 'discount_price', 'cost_price', 'stock_quantity',
      'low_stock_threshold', 'weight', 'dimensions', 'is_featured',
      'is_new', 'is_active',
    ];

    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    // Update slug if name changed
    if (data.name) {
      fields.push('slug = ?');
      values.push(slugify(data.name as string));
    }

    if (fields.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    values.push(id);
    await db.execute(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Update categories if provided
    if (Array.isArray(data.categories)) {
      await db.execute('DELETE FROM product_categories WHERE product_id = ?', [id]);
      for (let i = 0; i < data.categories.length; i++) {
        await db.execute(
          'INSERT INTO product_categories (product_id, category_id, is_primary) VALUES (?, ?, ?)',
          [id, data.categories[i], i === 0]
        );
      }
    }

    return this.getById(id);
  }

  // Delete a product (admin)
  async delete(id: number) {
    const product = await db.queryOne<IProduct>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await db.execute('DELETE FROM products WHERE id = ?', [id]);
  }

  // Get featured products
  async getFeatured(limit = 10) {
    return db.query<IProduct[]>(
      `SELECT p.*, b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as avg_rating
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = TRUE AND p.is_featured = TRUE
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );
  }

  // Get new arrivals
  async getNewArrivals(limit = 10) {
    return db.query<IProduct[]>(
      `SELECT p.*, b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as avg_rating
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = TRUE AND p.is_new = TRUE
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );
  }

  // Get related products (same category or brand)
  async getRelated(productId: number, limit = 4) {
    return db.query<IProduct[]>(
      `SELECT DISTINCT p.*, b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as review_count
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_categories pc ON p.id = pc.product_id
       WHERE p.is_active = TRUE AND p.id != ?
         AND (pc.category_id IN (SELECT category_id FROM product_categories WHERE product_id = ?)
              OR p.brand_id = (SELECT brand_id FROM products WHERE id = ?))
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [productId, productId, productId, limit]
    );
  }
}

export default new ProductService();
