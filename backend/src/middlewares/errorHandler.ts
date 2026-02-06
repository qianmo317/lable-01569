import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging (consider using a proper logger in production)
  if (!config.isProduction) {
    console.error('Error:', err);
  } else {
    // In production, log only essential info without stack trace
    console.error('Error:', err.message);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    message,
    // Never expose stack trace in production, regardless of NODE_ENV check
    ...(!config.isProduction && { stack: err.stack }),
  });
};

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `接口 ${req.originalUrl} 不存在`,
  });
};
