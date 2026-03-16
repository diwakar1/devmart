import db from '../config/database';
import { IWishlist, IProduct } from '../types';
import { NotFoundError, ConflictError } from '../utils/ApiError';
import { RowDataPacket } from 'mysql2/promise';

class WishlistService {
  // Get user's wishlist
  async getAll(userId: number) {
    return db.query<(IWishlist & RowDataPacket)[]>(
      `SELECT w.id, w.created_at, p.id as product_id, p.name, p.slug, p.price,
        p.discount_price, p.stock_quantity, p.is_active,
        b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id AND is_approved = TRUE) as avg_rating
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
  }

  // Add to wishlist
  async add(userId: number, productId: number) {
    // Check product exists
    const product = await db.queryOne<IProduct>(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if already in wishlist
    const existing = await db.queryOne<IWishlist>(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing) {
      throw new ConflictError('Product is already in your wishlist');
    }

    await db.execute(
      'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );

    return this.getAll(userId);
  }

  // Remove from wishlist
  async remove(userId: number, productId: number) {
    const item = await db.queryOne<IWishlist>(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (!item) {
      throw new NotFoundError('Item not found in wishlist');
    }

    await db.execute(
      'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
  }

  // Check if product is in wishlist
  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const item = await db.queryOne<IWishlist>(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return !!item;
  }
}

export default new WishlistService();
