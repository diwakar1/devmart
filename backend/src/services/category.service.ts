import db from '../config/database';
import { ICategory } from '../types';
import { slugify } from '../utils/helpers';
import { NotFoundError, BadRequestError } from '../utils/ApiError';

class CategoryService {
  // Get all categories (with hierarchy)
  async getAll(includeInactive = false) {
    const whereClause = includeInactive ? '' : 'WHERE is_active = TRUE';
    const categories = await db.query<ICategory[]>(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) as product_count
       FROM categories c ${whereClause} ORDER BY display_order, name`
    );

    // Build tree structure
    return this.buildTree(categories);
  }

  // Build hierarchical tree from flat list
  private buildTree(categories: ICategory[]) {
    const map = new Map<number, ICategory & { children: ICategory[] }>();
    const roots: (ICategory & { children: ICategory[] })[] = [];

    // First pass: create map
    for (const cat of categories) {
      map.set(cat.id, { ...cat, children: [] });
    }

    // Second pass: build hierarchy
    for (const cat of categories) {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  // Get category by ID
  async getById(id: number) {
    const category = await db.queryOne<ICategory>(
      `SELECT c.*,
        (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) as product_count
       FROM categories c WHERE c.id = ?`,
      [id]
    );

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Get subcategories
    const children = await db.query<ICategory[]>(
      'SELECT * FROM categories WHERE parent_id = ? AND is_active = TRUE ORDER BY display_order',
      [id]
    );

    return { ...category, children };
  }

  // Get category by slug
  async getBySlug(slug: string) {
    const category = await db.queryOne<ICategory>(
      'SELECT * FROM categories WHERE slug = ? AND is_active = TRUE',
      [slug]
    );

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return this.getById(category.id);
  }

  // Create category (admin)
  async create(data: {
    name: string;
    description?: string;
    parent_id?: number;
    image_url?: string;
    display_order?: number;
  }) {
    const slug = slugify(data.name);

    // Check for duplicate slug
    const existing = await db.queryOne<ICategory>(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    );
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    // Validate parent_id
    if (data.parent_id) {
      const parent = await db.queryOne<ICategory>(
        'SELECT id FROM categories WHERE id = ?',
        [data.parent_id]
      );
      if (!parent) {
        throw new BadRequestError('Parent category not found');
      }
    }

    const result = await db.execute(
      `INSERT INTO categories (name, slug, description, parent_id, image_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, finalSlug, data.description || null, data.parent_id || null,
       data.image_url || null, data.display_order || 0]
    );

    return this.getById(result.insertId);
  }

  // Update category (admin)
  async update(id: number, data: Record<string, unknown>) {
    const category = await db.queryOne<ICategory>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const allowedFields = ['name', 'description', 'parent_id', 'image_url', 'is_active', 'display_order'];
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
    await db.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.getById(id);
  }

  // Delete category (admin)
  async delete(id: number) {
    const category = await db.queryOne<ICategory>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Update children to have no parent
    await db.execute(
      'UPDATE categories SET parent_id = NULL WHERE parent_id = ?',
      [id]
    );

    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
  }
}

export default new CategoryService();
