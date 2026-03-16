import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import cartService from '../services/cart.service';
import { sendSuccess, sendNoContent } from '../utils/response';

class CartController {
  // GET /cart
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.getCart(req.user!.userId);
      sendSuccess(res, cart);
    } catch (error) {
      next(error);
    }
  }

  // POST /cart/items
  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { product_id, variant_id, quantity } = req.body;
      const cart = await cartService.addItem(
        req.user!.userId,
        product_id,
        variant_id || null,
        quantity || 1
      );
      sendSuccess(res, cart, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  }

  // PUT /cart/items/:itemId
  async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { quantity } = req.body;
      const cart = await cartService.updateItem(
        req.user!.userId,
        Number(req.params.itemId),
        quantity
      );
      sendSuccess(res, cart, 'Cart updated');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /cart/items/:itemId
  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.removeItem(
        req.user!.userId,
        Number(req.params.itemId)
      );
      sendSuccess(res, cart, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /cart
  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cartService.clearCart(req.user!.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
