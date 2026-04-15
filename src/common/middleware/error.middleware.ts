import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    logger.error(err, 'Unhandled Exception');
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.details && { details: err.details }),
  });
};
