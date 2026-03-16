import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import brandService from '../services/brand.service';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response';

class BrandController {
  // GET /brands
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        search: req.query.search as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
      };
      const { brands, total, page, limit } = await brandService.getAll(query);
      sendPaginated(res, brands, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  // GET /brands/:id
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.getById(Number(req.params.id));
      sendSuccess(res, brand);
    } catch (error) {
      next(error);
    }
  }

  // GET /brands/slug/:slug
  async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.getBySlug(req.params.slug);
      sendSuccess(res, brand);
    } catch (error) {
      next(error);
    }
  }

  // POST /brands (admin)
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.create(req.body);
      sendCreated(res, brand, 'Brand created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PUT /brands/:id (admin)
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.update(Number(req.params.id), req.body);
      sendSuccess(res, brand, 'Brand updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /brands/:id (admin)
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await brandService.delete(Number(req.params.id));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default new BrandController();
