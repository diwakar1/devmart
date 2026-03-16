import db from '../config/database';
import config from '../config';
import { IOrder, IOrderItem, ICart, ICartItem, ICoupon, IUser, GuestCheckoutRequest } from '../types';
import { generateOrderNumber, parsePagination } from '../utils/helpers';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { sendOrderConfirmationEmail } from '../utils/email';
import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import jwt from 'jsonwebtoken';

type SqlParams = (string | number | boolean | null | Buffer)[];

interface CountResult extends RowDataPacket {
  total: number;
}

class OrderService {
  // Simulate payment processing with test card numbers
  private simulatePayment(paymentMethod: string, cardNumber?: string): {
    success: boolean;
    transactionId: string;
    message: string;
  } {
    const txnId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Cash on delivery always succeeds (no card needed)
    if (paymentMethod === 'cash_on_delivery') {
      return { success: true, transactionId: txnId, message: 'Cash on delivery — payment pending on receipt' };
    }

    // PayPal always succeeds in demo mode
    if (paymentMethod === 'paypal') {
      return { success: true, transactionId: txnId, message: 'PayPal payment simulated successfully' };
    }

    // Card-based payments
    if (!cardNumber) {
      return { success: false, transactionId: txnId, message: 'Card number is required for card payments' };
    }

    const digits = cardNumber.replace(/\D/g, '');

    // Validate length (13-19 digits is standard)
    if (digits.length < 13 || digits.length > 19) {
      return { success: false, transactionId: txnId, message: 'Invalid card number' };
    }

    // Test cards that always DECLINE
    const declineCards = ['4000000000000002', '4000000000009995', '4000000000000069'];
    if (declineCards.includes(digits)) {
      return { success: false, transactionId: txnId, message: 'Card declined. Please try a different card.' };
    }

    // Test cards that always SUCCEED
    const approveCards = [
      '4242424242424242',  // Visa
      '4000056655665556',  // Visa (debit)
      '5555555555554444',  // Mastercard
      '5200828282828210',  // Mastercard (debit)
      '378282246310005',   // Amex
      '6011111111111117',  // Discover
    ];
    if (approveCards.includes(digits)) {
      return { success: true, transactionId: txnId, message: 'Payment approved' };
    }

    // For any other card number, approve if it passes Luhn check
    if (this.luhnCheck(digits)) {
      return { success: true, transactionId: txnId, message: 'Payment approved' };
    }

    return { success: false, transactionId: txnId, message: 'Invalid card number' };
  }

  private luhnCheck(digits: string): boolean {
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  // Create order from cart
  async createFromCart(
    userId: number,
    data: {
      shipping_address_id: number;
      billing_address_id?: number;
      payment_method: string;
      card_number?: string;
      customer_notes?: string;
      coupon_code?: string;
    }
  ) {
    const orderId = await db.transaction(async (conn: PoolConnection) => {
      // Get cart items
      const [cartRows] = await conn.execute<ICart[]>(
        'SELECT * FROM carts WHERE user_id = ?',
        [userId]
      );

      if (cartRows.length === 0) {
        throw new BadRequestError('Cart is empty');
      }

      const cart = cartRows[0];

      const [cartItems] = await conn.execute<(ICartItem & RowDataPacket)[]>(
        `SELECT ci.*, p.name as product_name, p.sku as product_sku, p.price as product_price,
          p.discount_price as product_discount_price, p.stock_quantity,
          pv.variant_name, pv.sku as variant_sku, pv.price as variant_price,
          pv.stock_quantity as variant_stock, pv.attributes as variant_attributes
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         LEFT JOIN product_variants pv ON ci.variant_id = pv.id
         WHERE ci.cart_id = ?`,
        [cart.id]
      );

      if (cartItems.length === 0) {
        throw new BadRequestError('Cart is empty');
      }

      // Calculate order totals
      let subtotal = 0;
      for (const item of cartItems) {
        const price = (item as Record<string, unknown>).variant_price as number
          || (item as Record<string, unknown>).product_discount_price as number
          || (item as Record<string, unknown>).product_price as number;
        subtotal += price * item.quantity;

        // Validate stock
        const availableStock = (item as Record<string, unknown>).variant_stock as number
          ?? (item as Record<string, unknown>).stock_quantity as number;
        if (item.quantity > availableStock) {
          throw new BadRequestError(
            `Insufficient stock for ${(item as Record<string, unknown>).product_name}. Only ${availableStock} available.`
          );
        }
      }

      const taxRate = 0.08; // 8% tax
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const shippingAmount = subtotal >= 100 ? 0 : 9.99; // Free shipping over $100
      let discountAmount = 0;

      // Apply coupon if provided
      if (data.coupon_code) {
        const [couponRows] = await conn.execute<ICoupon[]>(
          `SELECT * FROM coupons WHERE code = ? AND is_active = TRUE
           AND (valid_from IS NULL OR valid_from <= NOW())
           AND (valid_until IS NULL OR valid_until >= NOW())
           AND (usage_limit IS NULL OR used_count < usage_limit)`,
          [data.coupon_code]
        );

        if (couponRows.length > 0) {
          const coupon = couponRows[0];

          if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
            throw new BadRequestError(
              `Minimum purchase of $${coupon.min_purchase_amount} required for this coupon`
            );
          }

          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100;
            if (coupon.max_discount_amount) {
              discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
            }
          } else if (coupon.discount_type === 'fixed_amount') {
            discountAmount = coupon.discount_value;
          } else if (coupon.discount_type === 'free_shipping') {
            discountAmount = shippingAmount;
          }
        }
      }

      const totalAmount = Math.round((subtotal + taxAmount + shippingAmount - discountAmount) * 100) / 100;
      const orderNumber = generateOrderNumber();

      // Create order
      const [orderResult] = await conn.execute(
        `INSERT INTO orders (order_number, user_id, subtotal, tax_amount, shipping_amount,
          discount_amount, total_amount, status, payment_status,
          shipping_address_id, billing_address_id, customer_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?)`,
        [
          orderNumber, userId, subtotal, taxAmount, shippingAmount,
          discountAmount, totalAmount,
          data.shipping_address_id, data.billing_address_id || data.shipping_address_id,
          data.customer_notes || null,
        ]
      );

      const orderId = (orderResult as { insertId: number }).insertId;

      // Create order items
      for (const item of cartItems) {
        const price = (item as Record<string, unknown>).variant_price as number
          || (item as Record<string, unknown>).product_discount_price as number
          || (item as Record<string, unknown>).product_price as number;
        const itemTotal = price * item.quantity;

        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, variant_id, product_name,
            product_sku, variant_info, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, item.product_id,
            item.variant_id > 0 ? item.variant_id : null,
            (item as Record<string, unknown>).product_name,
            (item as Record<string, unknown>).variant_sku || (item as Record<string, unknown>).product_sku,
            (item as Record<string, unknown>).variant_attributes || null,
            item.quantity, price, itemTotal,
          ] as SqlParams
        );
      }

      // Create payment record
      const paymentResult = this.simulatePayment(data.payment_method, data.card_number);
      const paymentStatus = paymentResult.success ? 'completed' : 'failed';

      await conn.execute(
        `INSERT INTO payments (order_id, payment_method, amount, currency, status, transaction_id, payment_gateway_response)
         VALUES (?, ?, ?, 'USD', ?, ?, ?)`,
        [orderId, data.payment_method, totalAmount, paymentStatus, paymentResult.transactionId, JSON.stringify(paymentResult)]
      );

      // Update order payment_status
      if (paymentResult.success && data.payment_method !== 'cash_on_delivery') {
        await conn.execute(
          'UPDATE orders SET payment_status = ? WHERE id = ?',
          ['paid', orderId]
        );
      } else if (!paymentResult.success) {
        await conn.execute(
          'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
          ['failed', 'cancelled', orderId]
        );
      }

      // Decrement stock
      for (const item of cartItems) {
        if (item.variant_id > 0) {
          await conn.execute(
            'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [item.quantity, item.variant_id]
          );
        }
        await conn.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Record coupon usage
      if (data.coupon_code && discountAmount > 0) {
        const [couponRows] = await conn.execute<ICoupon[]>(
          'SELECT id FROM coupons WHERE code = ?',
          [data.coupon_code]
        );
        if (couponRows.length > 0) {
          await conn.execute(
            'INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)',
            [couponRows[0].id, userId, orderId, discountAmount]
          );
        }
      }

      // Clear cart
      await conn.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

      // If payment failed, throw error after cleanup
      if (!paymentResult.success) {
        throw new BadRequestError(paymentResult.message);
      }

      return orderId;
    });

    const order = await this.getById(orderId);

    // Send confirmation email (non-blocking)
    const user = await db.queryOne<IUser>('SELECT email, first_name, last_name FROM users WHERE id = ?', [userId]);
    if (user) {
      const trackToken = jwt.sign({ orderNumber: order.order_number, email: user.email }, config.jwt.secret, { expiresIn: '90d' });
      sendOrderConfirmationEmail({
        orderNumber: order.order_number,
        customerName: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Customer',
        customerEmail: user.email,
        items: order.items || [],
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        shippingAmount: order.shipping_amount,
        discountAmount: order.discount_amount,
        totalAmount: order.total_amount,
        paymentMethod: data.payment_method,
        paymentStatus: order.payment_status,
        trackingUrl: `${config.frontendUrl}/track-order?token=${trackToken}`,
      });
    }

    return order;
  }
  async createGuestOrder(data: GuestCheckoutRequest) {
    const orderId = await db.transaction(async (conn: PoolConnection) => {
      const items = data.items;

      // Validate and calculate totals
      let subtotal = 0;
      const resolvedItems: {
        product_id: number;
        variant_id: number | null;
        quantity: number;
        price: number;
        product_name: string;
        product_sku: string;
        variant_sku: string | null;
        variant_attributes: string | null;
      }[] = [];

      for (const item of items) {
        const [productRows] = await conn.query<(RowDataPacket)[]>(
          'SELECT id, name, sku, price, discount_price, stock_quantity FROM products WHERE id = ? AND is_active = TRUE',
          [item.product_id]
        );

        if (productRows.length === 0) {
          throw new BadRequestError(`Product #${item.product_id} not found or inactive`);
        }

        const product = productRows[0];
        let price = (product as Record<string, unknown>).discount_price as number || (product as Record<string, unknown>).price as number;
        let variantSku: string | null = null;
        let variantAttributes: string | null = null;
        let availableStock = (product as Record<string, unknown>).stock_quantity as number;

        if (item.variant_id) {
          const [variantRows] = await conn.query<(RowDataPacket)[]>(
            'SELECT id, sku, price, stock_quantity, attributes FROM product_variants WHERE id = ? AND product_id = ? AND is_active = TRUE',
            [item.variant_id, item.product_id]
          );

          if (variantRows.length > 0) {
            const variant = variantRows[0];
            if ((variant as Record<string, unknown>).price) {
              price = (variant as Record<string, unknown>).price as number;
            }
            variantSku = (variant as Record<string, unknown>).sku as string;
            variantAttributes = (variant as Record<string, unknown>).attributes as string;
            availableStock = (variant as Record<string, unknown>).stock_quantity as number;
          }
        }

        if (item.quantity > availableStock) {
          throw new BadRequestError(
            `Insufficient stock for ${(product as Record<string, unknown>).name}. Only ${availableStock} available.`
          );
        }

        subtotal += price * item.quantity;
        resolvedItems.push({
          product_id: item.product_id,
          variant_id: item.variant_id ?? null,
          quantity: item.quantity,
          price,
          product_name: (product as Record<string, unknown>).name as string,
          product_sku: (product as Record<string, unknown>).sku as string,
          variant_sku: variantSku,
          variant_attributes: variantAttributes,
        });
      }

      const taxRate = 0.08;
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const shippingAmount = subtotal >= 100 ? 0 : 9.99;
      let discountAmount = 0;

      // Apply coupon if provided
      if (data.coupon_code) {
        const [couponRows] = await conn.query<ICoupon[]>(
          `SELECT * FROM coupons WHERE code = ? AND is_active = TRUE
           AND (valid_from IS NULL OR valid_from <= NOW())
           AND (valid_until IS NULL OR valid_until >= NOW())
           AND (usage_limit IS NULL OR used_count < usage_limit)`,
          [data.coupon_code]
        );

        if (couponRows.length > 0) {
          const coupon = couponRows[0];
          if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
            throw new BadRequestError(
              `Minimum purchase of $${coupon.min_purchase_amount} required for this coupon`
            );
          }
          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100;
            if (coupon.max_discount_amount) {
              discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
            }
          } else if (coupon.discount_type === 'fixed_amount') {
            discountAmount = coupon.discount_value;
          } else if (coupon.discount_type === 'free_shipping') {
            discountAmount = shippingAmount;
          }
        }
      }

      const totalAmount = Math.round((subtotal + taxAmount + shippingAmount - discountAmount) * 100) / 100;
      const orderNumber = generateOrderNumber();

      // Create order (user_id = NULL for guest)
      const [orderResult] = await conn.query(
        `INSERT INTO orders (order_number, user_id, subtotal, tax_amount, shipping_amount,
          discount_amount, total_amount, status, payment_status,
          shipping_address_id, billing_address_id, customer_notes,
          guest_email, guest_name, guest_phone, shipping_address_data)
         VALUES (?, NULL, ?, ?, ?, ?, ?, 'pending', 'pending', NULL, NULL, ?, ?, ?, ?, ?)`,
        [
          orderNumber, subtotal, taxAmount, shippingAmount,
          discountAmount, totalAmount,
          data.customer_notes || null,
          data.shipping_address.email,
          data.shipping_address.full_name,
          data.shipping_address.phone,
          JSON.stringify(data.shipping_address),
        ]
      );

      const orderId = (orderResult as { insertId: number }).insertId;

      // Create order items
      for (const item of resolvedItems) {
        const itemTotal = item.price * item.quantity;
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, variant_id, product_name,
            product_sku, variant_info, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, item.product_id,
            item.variant_id,
            item.product_name,
            item.variant_sku || item.product_sku,
            item.variant_attributes || null,
            item.quantity, item.price, itemTotal,
          ] as SqlParams
        );
      }

      // Create payment record
      const paymentResult = this.simulatePayment(data.payment_method, data.card_number);
      const guestPaymentStatus = paymentResult.success ? 'completed' : 'failed';

      await conn.query(
        `INSERT INTO payments (order_id, payment_method, amount, currency, status, transaction_id, payment_gateway_response)
         VALUES (?, ?, ?, 'USD', ?, ?, ?)`,
        [orderId, data.payment_method, totalAmount, guestPaymentStatus, paymentResult.transactionId, JSON.stringify(paymentResult)]
      );

      // Update order payment_status
      if (paymentResult.success && data.payment_method !== 'cash_on_delivery') {
        await conn.query(
          'UPDATE orders SET payment_status = ? WHERE id = ?',
          ['paid', orderId]
        );
      } else if (!paymentResult.success) {
        await conn.query(
          'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
          ['failed', 'cancelled', orderId]
        );
      }

      // Decrement stock
      for (const item of resolvedItems) {
        if (item.variant_id) {
          await conn.query(
            'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [item.quantity, item.variant_id]
          );
        }
        await conn.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Record coupon usage
      if (data.coupon_code && discountAmount > 0) {
        const [couponRows] = await conn.query<ICoupon[]>(
          'SELECT id FROM coupons WHERE code = ?',
          [data.coupon_code]
        );
        if (couponRows.length > 0) {
          await conn.query(
            'INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) VALUES (?, NULL, ?, ?)',
            [couponRows[0].id, orderId, discountAmount]
          );
        }
      }

      // If payment failed, throw error after recording
      if (!paymentResult.success) {
        throw new BadRequestError(paymentResult.message);
      }

      return orderId;
    });

    const order = await this.getById(orderId);

    // Send confirmation email (non-blocking)
    const guestEmail = data.shipping_address.email;
    const guestName = data.shipping_address.full_name;
    const trackToken = jwt.sign({ orderNumber: order.order_number, email: guestEmail }, config.jwt.secret, { expiresIn: '90d' });
    sendOrderConfirmationEmail({
      orderNumber: order.order_number,
      customerName: guestName,
      customerEmail: guestEmail,
      items: order.items || [],
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      shippingAmount: order.shipping_amount,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      paymentMethod: data.payment_method,
      paymentStatus: order.payment_status,
      trackingUrl: `${config.frontendUrl}/track-order?token=${trackToken}`,
    });

    return order;
  }

  // Get order by ID
  async getById(id: number, userId?: number) {
    let query = `SELECT o.*, 
      sa.full_name as shipping_name, sa.address_line1 as shipping_address,
      sa.city as shipping_city, sa.state as shipping_state, sa.postal_code as shipping_zip
     FROM orders o
     LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
     WHERE o.id = ?`;
    const params: unknown[] = [id];

    if (userId) {
      query += ' AND o.user_id = ?';
      params.push(userId);
    }

    const order = await db.queryOne<IOrder>(query, params);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Get order items
    const items = await db.query<IOrderItem[]>(
      `SELECT oi.*,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = TRUE LIMIT 1) as product_image
       FROM order_items oi WHERE oi.order_id = ?`,
      [id]
    );

    // Get payment info
    const payment = await db.queryOne<RowDataPacket>(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
      [id]
    );

    return { ...order, items, payment };
  }

  // Track order by order number + email (works for both guest and registered users)
  async trackGuestOrder(orderNumber: string, email: string) {
    // Try guest order first, then registered user order
    let order = await db.queryOne<IOrder>(
      `SELECT o.* FROM orders o
       WHERE o.order_number = ? AND o.guest_email = ?`,
      [orderNumber, email]
    );

    if (!order) {
      // Try matching by user email for registered users
      order = await db.queryOne<IOrder>(
        `SELECT o.* FROM orders o
         INNER JOIN users u ON o.user_id = u.id
         WHERE o.order_number = ? AND u.email = ?`,
        [orderNumber, email]
      );
    }

    if (!order) {
      throw new NotFoundError('Order not found. Please check your order number and email.');
    }

    const items = await db.query<IOrderItem[]>(
      `SELECT oi.*,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = TRUE LIMIT 1) as product_image
       FROM order_items oi WHERE oi.order_id = ?`,
      [order.id]
    );

    const payment = await db.queryOne<RowDataPacket>(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
      [order.id]
    );

    return { ...order, items, payment };
  }

  // Get user's orders
  async getUserOrders(userId: number, query: { page?: number; limit?: number; status?: string }) {
    const { page, limit, offset } = parsePagination(query);

    let whereClause = 'WHERE o.user_id = ?';
    const params: unknown[] = [userId];

    if (query.status) {
      whereClause += ' AND o.status = ?';
      params.push(query.status);
    }

    const countResult = await db.queryOne<CountResult>(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    const orders = await db.query<IOrder[]>(
      `SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { orders, total, page, limit };
  }

  // Get all orders (admin)
  async getAllOrders(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page, limit, offset } = parsePagination(query);

    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (query.status) {
      whereClause += ' AND o.status = ?';
      params.push(query.status);
    }

    if (query.search) {
      whereClause += ' AND (o.order_number LIKE ? OR u.email LIKE ? OR u.first_name LIKE ?)';
      const searchTerm = `%${query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await db.queryOne<CountResult>(
      `SELECT COUNT(*) as total FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    const orders = await db.query<IOrder[]>(
      `SELECT o.*, u.email as user_email, u.first_name, u.last_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { orders, total, page, limit };
  }

  // Update order status (admin)
  async updateStatus(orderId: number, status: string, _adminId: number, _notes?: string) {
    const order = await db.queryOne<IOrder>(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Invalid order status');
    }

    await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    // If shipped, update shipped_at
    if (status === 'shipped') {
      await db.execute('UPDATE orders SET shipped_at = NOW() WHERE id = ?', [orderId]);
    }

    // If delivered, update delivered_at
    if (status === 'delivered') {
      await db.execute('UPDATE orders SET delivered_at = NOW() WHERE id = ?', [orderId]);
    }

    // If cancelled/refunded, update payment status
    if (status === 'cancelled' || status === 'refunded') {
      await db.execute(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        [status === 'cancelled' ? 'failed' : 'refunded', orderId]
      );
    }

    return this.getById(orderId);
  }

  // Update tracking info (admin)
  async updateTracking(
    orderId: number,
    data: { tracking_number?: string; tracking_url?: string; shipping_provider?: string }
  ) {
    const order = await db.queryOne<IOrder>(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.tracking_number) {
      fields.push('tracking_number = ?');
      values.push(data.tracking_number);
    }
    if (data.tracking_url) {
      fields.push('tracking_url = ?');
      values.push(data.tracking_url);
    }
    if (data.shipping_provider) {
      fields.push('shipping_provider = ?');
      values.push(data.shipping_provider);
    }

    if (fields.length > 0) {
      values.push(orderId);
      await db.execute(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(orderId);
  }

  // Cancel order (user)
  async cancelOrder(orderId: number, userId: number) {
    const order = await db.queryOne<IOrder>(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!['pending', 'processing'].includes(order.status)) {
      throw new BadRequestError('This order cannot be cancelled');
    }

    await db.execute(
      "UPDATE orders SET status = 'cancelled', payment_status = 'failed' WHERE id = ?",
      [orderId]
    );

    return this.getById(orderId, userId);
  }
}

export default new OrderService();
