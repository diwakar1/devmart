import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import userService from '../services/user.service';
import { sendSuccess, sendPaginated } from '../utils/response';

class UserController {
  // GET /users (admin)
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string,
        role: req.query.role as string,
      };
      const { users, total, page, limit } = await userService.getAll(query);
      sendPaginated(res, users, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  // GET /users/:id (admin)
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(Number(req.params.id));
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/:id/toggle-active (admin)
  async toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.toggleActive(Number(req.params.id));
      sendSuccess(res, user, 'User status updated');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/:id/role (admin)
  async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const user = await userService.updateRole(Number(req.params.id), role);
      sendSuccess(res, user, 'User role updated');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
