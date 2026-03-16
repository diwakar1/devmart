import db from '../config/database';
import { IReview } from '../types';
import { parsePagination } from '../utils/helpers';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/ApiError';
import { RowDataPacket } from 'mysql2/promise';

interface CountResult extends RowDataPacket {
  total: number;
}

class ReviewService {
  // Get reviews for a product
  async getProductReviews(productId: number, query: { page?: number; limit?: number; sortBy?: string }) {
    const { page, limit, offset, sortBy, sortOrder } = parsePagination(query);

    const allowedSortColumns = ['created_at', 'rating', 'helpful_count'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';

    const countResult = await db.queryOne<CountResult>(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = TRUE',
      [productId]
    );
    const total = countResult?.total || 0;

    const reviews = await db.query<(IReview & RowDataPacket)[]>(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = TRUE
       ORDER BY r.${safeSortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );

    // Get rating summary
    const ratingSummary = await db.queryOne<RowDataPacket>(
      `SELECT 
        ROUND(AVG(rating), 1) as average_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews WHERE product_id = ? AND is_approved = TRUE`,
      [productId]
    );

    return { reviews, ratingSummary, total, page, limit };
  }

  // Create review
  async create(userId: number, productId: number, data: {
    rating: number;
    title?: string;
    comment?: string;
  }) {
    // Check if user already reviewed this product
    const existing = await db.queryOne<IReview>(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing) {
      throw new ConflictError('You have already reviewed this product');
    }

    // Check if user purchased this product (for verified purchase badge)
    const purchaseCheck = await db.queryOne<RowDataPacket>(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'`,
      [userId, productId]
    );

    const result = await db.execute(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, userId, data.rating, data.title || null, data.comment || null, !!purchaseCheck]
    );

    return db.queryOne<IReview>(
      'SELECT * FROM reviews WHERE id = ?',
      [result.insertId]
    );
  }

  // Update review
  async update(reviewId: number, userId: number, data: {
    rating?: number;
    title?: string;
    comment?: string;
  }) {
    const review = await db.queryOne<IReview>(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.rating !== undefined) {
      fields.push('rating = ?');
      values.push(data.rating);
    }
    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.comment !== undefined) {
      fields.push('comment = ?');
      values.push(data.comment);
    }

    if (fields.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    values.push(reviewId);
    await db.execute(
      `UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return db.queryOne<IReview>('SELECT * FROM reviews WHERE id = ?', [reviewId]);
  }

  // Delete review
  async delete(reviewId: number, userId: number, isAdmin = false) {
    let query = 'SELECT * FROM reviews WHERE id = ?';
    const params: unknown[] = [reviewId];

    if (!isAdmin) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    const review = await db.queryOne<IReview>(query, params);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    await db.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
  }

  // Vote review as helpful
  async voteHelpful(reviewId: number, userId: number) {
    // Check if already voted
    const existing = await db.queryOne<RowDataPacket>(
      'SELECT id FROM review_votes WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (existing) {
      throw new ConflictError('You already voted on this review');
    }

    await db.execute(
      'INSERT INTO review_votes (review_id, user_id) VALUES (?, ?)',
      [reviewId, userId]
    );

    // helpful_count is updated via the review_votes insert (we update manually)
    await db.execute(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
      [reviewId]
    );
  }
}

export default new ReviewService();
