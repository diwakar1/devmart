import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import productService from '../services/product.service';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response';

class ProductController {
  // GET /products
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        category: req.query.category ? Number(req.query.category) : undefined,
        brand: req.query.brand ? Number(req.query.brand) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        isFeatured: req.query.isFeatured === 'true' ? true : undefined,
        isNew: req.query.isNew === 'true' ? true : undefined,
        inStock: req.query.inStock === 'true' ? true : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
      };
      const { products, total, page, limit } = await productService.getAll(filters);
      sendPaginated(res, products, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  // GET /products/featured
  async getFeatured(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const products = await productService.getFeatured(limit);
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  }

  // GET /products/new-arrivals
  async getNewArrivals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const products = await productService.getNewArrivals(limit);
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  }

  // GET /products/:id
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(Number(req.params.id));
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  // GET /products/slug/:slug
  async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.getBySlug(req.params.slug);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  // POST /products (admin)
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      sendCreated(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PUT /products/:id (admin)
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(Number(req.params.id), req.body);
      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /products/:id (admin)
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await productService.delete(Number(req.params.id));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  // GET /products/:id/related
  async getRelated(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 4;
      const products = await productService.getRelated(Number(req.params.id), limit);
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
