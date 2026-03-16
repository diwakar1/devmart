import db from '../config/database';
import { ICart, ICartItem, IProduct, IProductVariant } from '../types';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { RowDataPacket } from 'mysql2/promise';

interface CartItemJoined extends RowDataPacket {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  price_snapshot: number;
  product_name: string;
  product_slug: string;
  product_price: number;
  product_discount_price: number | null;
  product_stock: number;
  product_image: string | null;
  variant_name: string | null;
  variant_sku: string | null;
  variant_price: number | null;
  variant_stock: number | null;
}

class CartService {
  // Get or create cart for user
  private async getOrCreateCart(userId: number): Promise<ICart> {
    let cart = await db.queryOne<ICart>(
      'SELECT * FROM carts WHERE user_id = ?',
      [userId]
    );

    if (!cart) {
      const result = await db.execute(
        'INSERT INTO carts (user_id) VALUES (?)',
        [userId]
      );
      cart = await db.queryOne<ICart>(
        'SELECT * FROM carts WHERE id = ?',
        [result.insertId]
      );
    }

    return cart!;
  }

  // Get cart with items
  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    const items = await db.query<CartItemJoined[]>(
      `SELECT ci.*, 
        p.name as product_name, p.slug as product_slug, 
        p.price as product_price, p.discount_price as product_discount_price,
        p.stock_quantity as product_stock,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image,
        pv.variant_name, pv.sku as variant_sku, pv.price as variant_price, pv.stock_quantity as variant_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cart.id]
    );

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;
    for (const item of items) {
      const price = item.variant_price || item.product_discount_price || item.product_price;
      subtotal += price * item.quantity;
      itemCount += item.quantity;
    }

    return {
      id: cart.id,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount,
    };
  }

  // Add item to cart
  async addItem(userId: number, productId: number, variantId: number | null, quantity: number) {
    // Validate product
    const product = await db.queryOne<IProduct>(
      'SELECT * FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Validate variant if provided
    let availableStock = product.stock_quantity;
    if (variantId) {
      const variant = await db.queryOne<IProductVariant>(
        'SELECT * FROM product_variants WHERE id = ? AND product_id = ? AND is_active = TRUE',
        [variantId, productId]
      );
      if (!variant) {
        throw new NotFoundError('Product variant not found');
      }
      availableStock = variant.stock_quantity;
    }

    if (quantity > availableStock) {
      throw new BadRequestError(`Only ${availableStock} items available in stock`);
    }

    const cart = await this.getOrCreateCart(userId);
    // Check if item already in cart
    const existingItem = variantId
      ? await db.queryOne<ICartItem>(
          'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND variant_id = ?',
          [cart.id, productId, variantId]
        )
      : await db.queryOne<ICartItem>(
          'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND variant_id IS NULL',
          [cart.id, productId]
        );

    const priceSnapshot = product.discount_price || product.price;

    if (existingItem) {
      if (quantity > availableStock) {
        throw new BadRequestError(`Only ${availableStock} items available in stock`);
      }

      await db.execute(
        'UPDATE cart_items SET quantity = ?, price_snapshot = ? WHERE id = ?',
        [quantity, priceSnapshot, existingItem.id]
      );
    } else {
      await db.execute(
        'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price_snapshot) VALUES (?, ?, ?, ?, ?)',
        [cart.id, productId, variantId, quantity, priceSnapshot]
      );
    }

    return this.getCart(userId);
  }

  // Update item quantity
  async updateItem(userId: number, itemId: number, quantity: number) {
    const cart = await this.getOrCreateCart(userId);

    const item = await db.queryOne<ICartItem>(
      'SELECT * FROM cart_items WHERE id = ? AND cart_id = ?',
      [itemId, cart.id]
    );

    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    if (quantity <= 0) {
      // Remove item
      await db.execute('DELETE FROM cart_items WHERE id = ?', [itemId]);
    } else {
      // Validate stock
      const product = await db.queryOne<IProduct>(
        'SELECT stock_quantity FROM products WHERE id = ?',
        [item.product_id]
      );

      if (product && quantity > product.stock_quantity) {
        throw new BadRequestError(`Only ${product.stock_quantity} items available`);
      }

      await db.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [quantity, itemId]
      );
    }

    return this.getCart(userId);
  }

  // Remove item from cart
  async removeItem(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);

    const item = await db.queryOne<ICartItem>(
      'SELECT * FROM cart_items WHERE id = ? AND cart_id = ?',
      [itemId, cart.id]
    );

    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    await db.execute('DELETE FROM cart_items WHERE id = ?', [itemId]);

    return this.getCart(userId);
  }

  // Clear cart
  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    await db.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
  }
}

export default new CartService();
