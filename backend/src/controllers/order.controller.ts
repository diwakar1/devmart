import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import orderService from '../services/order.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import jwt from 'jsonwebtoken';
import config from '../config';

class OrderController {
  // POST /orders
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createFromCart(req.user!.userId, req.body);
      sendCreated(res, order, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /orders/guest  (no auth required)
  async guestCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createGuestOrder(req.body);
      sendCreated(res, order, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /orders/track  (no auth required — guest order lookup)
  async trackOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { order_number, email } = req.body;
      const order = await orderService.trackGuestOrder(order_number, email);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  // GET /orders/track/:token  (email link — token contains order_number + email)
  async trackByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const decoded = jwt.verify(req.params.token, config.jwt.secret) as { orderNumber: string; email: string };
      const order = await orderService.trackGuestOrder(decoded.orderNumber, decoded.email);
      sendSuccess(res, order);
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        res.status(400).json({ success: false, message: 'Invalid or expired tracking link' });
        return;
      }
      next(error);
    }
  }

  // GET /orders (user's orders)
  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as string,
      };
      const { orders, total, page, limit } = await orderService.getUserOrders(req.user!.userId, query);
      sendPaginated(res, orders, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  // GET /orders/:id
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.role === 'admin' ? undefined : req.user!.userId;
      const order = await orderService.getById(Number(req.params.id), userId);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  // POST /orders/:id/cancel
  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.cancelOrder(Number(req.params.id), req.user!.userId);
      sendSuccess(res, order, 'Order cancelled');
    } catch (error) {
      next(error);
    }
  }

  // GET /orders/admin/all (admin)
  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as string,
        search: req.query.search as string,
      };
      const { orders, total, page, limit } = await orderService.getAllOrders(query);
      sendPaginated(res, orders, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /orders/:id/status (admin)
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      const order = await orderService.updateStatus(
        Number(req.params.id),
        status,
        req.user!.userId,
        notes
      );
      sendSuccess(res, order, 'Order status updated');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /orders/:id/tracking (admin)
  async updateTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.updateTracking(Number(req.params.id), req.body);
      sendSuccess(res, order, 'Tracking info updated');
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
