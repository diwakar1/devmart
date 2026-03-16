import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import reviewService from '../services/review.service';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response';

class ReviewController {
  // GET /reviews/product/:productId
  async getProductReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        sortBy: req.query.sortBy as string,
      };
      const result = await reviewService.getProductReviews(Number(req.params.productId), query);
      sendPaginated(res, { reviews: result.reviews, ratingSummary: result.ratingSummary }, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /reviews/product/:productId
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.create(
        req.user!.userId,
        Number(req.params.productId),
        req.body
      );
      sendCreated(res, review, 'Review submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  // PUT /reviews/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.update(
        Number(req.params.id),
        req.user!.userId,
        req.body
      );
      sendSuccess(res, review, 'Review updated');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /reviews/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'admin';
      await reviewService.delete(Number(req.params.id), req.user!.userId, isAdmin);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  // POST /reviews/:id/helpful
  async voteHelpful(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await reviewService.voteHelpful(Number(req.params.id), req.user!.userId);
      sendSuccess(res, null, 'Vote recorded');
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
