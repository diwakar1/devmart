import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import wishlistService from '../services/wishlist.service';
import { sendSuccess, sendNoContent } from '../utils/response';

class WishlistController {
  // GET /wishlist
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const wishlist = await wishlistService.getAll(req.user!.userId);
      sendSuccess(res, wishlist);
    } catch (error) {
      next(error);
    }
  }

  // POST /wishlist/:productId
  async add(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const wishlist = await wishlistService.add(req.user!.userId, Number(req.params.productId));
      sendSuccess(res, wishlist, 'Added to wishlist');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /wishlist/:productId
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await wishlistService.remove(req.user!.userId, Number(req.params.productId));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  // GET /wishlist/check/:productId
  async check(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isInWishlist = await wishlistService.isInWishlist(
        req.user!.userId,
        Number(req.params.productId)
      );
      sendSuccess(res, { isInWishlist });
    } catch (error) {
      next(error);
    }
  }
}

export default new WishlistController();
