import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger';
import { ApiResponse } from '../utils/api-response';
import { ResponseCode } from '../constants/response-codes';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
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
  const code = err.code || ResponseCode.INTERNAL_SERVER_ERROR;

  if (statusCode === 500) {
    logger.error(err, 'Unhandled Exception');
  }

  const data = {
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.details && { details: err.details }),
  };

  return ApiResponse.send(res, {
    statusCode,
    code,
    message,
    data,
  });
};
