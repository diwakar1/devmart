import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import categoryService from '../services/category.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

class CategoryController {
  // GET /categories
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await categoryService.getAll(includeInactive);
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  // GET /categories/:id
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getById(Number(req.params.id));
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  // GET /categories/slug/:slug
  async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getBySlug(req.params.slug);
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  // POST /categories (admin)
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      sendCreated(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PUT /categories/:id (admin)
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(Number(req.params.id), req.body);
      sendSuccess(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /categories/:id (admin)
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await categoryService.delete(Number(req.params.id));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
