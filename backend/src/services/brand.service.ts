import db from '../config/database';
import { IBrand } from '../types';
import { slugify, parsePagination } from '../utils/helpers';
import { PaginationQuery } from '../types';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { RowDataPacket } from 'mysql2/promise';

interface CountResult extends RowDataPacket {
  total: number;
}

class BrandService {
  // Get all brands
  async getAll(query: PaginationQuery & { search?: string }) {
    const { page, limit, offset, sortBy, sortOrder } = parsePagination(query);

    const allowedSortColumns = ['name', 'created_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';

    let whereClause = 'WHERE is_active = TRUE';
    const params: unknown[] = [];

    if (query.search) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${query.search}%`);
    }

    const countResult = await db.queryOne<CountResult>(
      `SELECT COUNT(*) as total FROM brands ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    const brands = await db.query<IBrand[]>(
      `SELECT b.*,
        (SELECT COUNT(*) FROM products WHERE brand_id = b.id AND is_active = TRUE) as product_count
       FROM brands b ${whereClause}
       ORDER BY ${safeSortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { brands, total, page, limit };
  }

  // Get brand by ID
  async getById(id: number) {
    const brand = await db.queryOne<IBrand>(
      `SELECT b.*,
        (SELECT COUNT(*) FROM products WHERE brand_id = b.id AND is_active = TRUE) as product_count
       FROM brands b WHERE b.id = ?`,
      [id]
    );

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    return brand;
  }

  // Get brand by slug
  async getBySlug(slug: string) {
    const brand = await db.queryOne<IBrand>(
      'SELECT id FROM brands WHERE slug = ? AND is_active = TRUE',
      [slug]
    );

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    return this.getById(brand.id);
  }

  // Create brand (admin)
  async create(data: {
    name: string;
    description?: string;
    logo_url?: string;
    website_url?: string;
  }) {
    const slug = slugify(data.name);

    const existing = await db.queryOne<IBrand>(
      'SELECT id FROM brands WHERE slug = ?',
      [slug]
    );
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const result = await db.execute(
      `INSERT INTO brands (name, slug, description, logo_url, website_url)
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, finalSlug, data.description || null, data.logo_url || null, data.website_url || null]
    );

    return this.getById(result.insertId);
  }

  // Update brand (admin)
  async update(id: number, data: Record<string, unknown>) {
    const brand = await db.queryOne<IBrand>(
      'SELECT * FROM brands WHERE id = ?',
      [id]
    );

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    const allowedFields = ['name', 'description', 'logo_url', 'website_url', 'is_active'];
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (data.name) {
      fields.push('slug = ?');
      values.push(slugify(data.name as string));
    }

    if (fields.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    values.push(id);
    await db.execute(`UPDATE brands SET ${fields.join(', ')} WHERE id = ?`, values);

    return this.getById(id);
  }

  // Delete brand (admin)
  async delete(id: number) {
    const brand = await db.queryOne<IBrand>(
      'SELECT * FROM brands WHERE id = ?',
      [id]
    );

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    await db.execute('DELETE FROM brands WHERE id = ?', [id]);
  }
}

export default new BrandService();
