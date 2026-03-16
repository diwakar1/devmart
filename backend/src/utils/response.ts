import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

// Success response
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

// Created response (201)
export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

// Paginated response
export const sendPaginated = <T>(
  res: Response,
  data: T,
  pagination: { page: number; limit: number; total: number },
  message = 'Success'
): Response => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };
  return res.status(200).json(response);
};

// Error response
export const sendError = (
  res: Response,
  message = 'Error',
  statusCode = 500,
  errors?: unknown[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
};

// No content response (204)
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};
