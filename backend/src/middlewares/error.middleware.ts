import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError } from '../utils/ApiError';
import { sendError } from '../utils/response';
import config from '../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
  }

  // Handle known API errors
  if (err instanceof ValidationError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof ApiError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // Handle MySQL duplicate key error
  if ((err as unknown as Record<string, unknown>).code === 'ER_DUP_ENTRY') {
    sendError(res, 'Duplicate entry. This resource already exists.', 409);
    return;
  }

  // Handle MySQL foreign key constraint error
  if ((err as unknown as Record<string, unknown>).code === 'ER_NO_REFERENCED_ROW_2') {
    sendError(res, 'Referenced resource not found', 400);
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    sendError(res, 'Validation failed', 422);
    return;
  }

  // Default: Internal server error
  const message = config.nodeEnv === 'development' ? err.message : 'Internal server error';
  sendError(res, message, 500);
};

// 404 Not Found handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
