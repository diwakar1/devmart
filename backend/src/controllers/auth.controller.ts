import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import authService from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';

class AuthController {
  // POST /auth/register
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;
      const result = await authService.register({ email, password, first_name, last_name, phone });

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendCreated(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/login
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');
      const result = await authService.login(email, password, ipAddress, userAgent);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/refresh
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const result = await authService.refreshToken(refreshToken);

      // Update cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout-all
  async logoutAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logoutAll(req.user!.userId);
      res.clearCookie('refreshToken');
      sendSuccess(res, null, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  }

  // GET /auth/profile
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  // PUT /auth/profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { first_name, last_name, phone } = req.body;
      const user = await authService.updateProfile(req.user!.userId, { first_name, last_name, phone });
      sendSuccess(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  // PUT /auth/change-password
  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { current_password, new_password } = req.body;
      await authService.changePassword(req.user!.userId, current_password, new_password);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
