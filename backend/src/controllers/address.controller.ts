import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import addressService from '../services/address.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

class AddressController {
  // GET /addresses
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await addressService.getAll(req.user!.userId);
      sendSuccess(res, addresses);
    } catch (error) {
      next(error);
    }
  }

  // GET /addresses/:id
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.getById(Number(req.params.id), req.user!.userId);
      sendSuccess(res, address);
    } catch (error) {
      next(error);
    }
  }

  // POST /addresses
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.create(req.user!.userId, req.body);
      sendCreated(res, address, 'Address created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PUT /addresses/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.update(Number(req.params.id), req.user!.userId, req.body);
      sendSuccess(res, address, 'Address updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /addresses/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await addressService.delete(Number(req.params.id), req.user!.userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /addresses/:id/default
  async setDefault(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.setDefault(Number(req.params.id), req.user!.userId);
      sendSuccess(res, address, 'Default address updated');
    } catch (error) {
      next(error);
    }
  }
}

export default new AddressController();
