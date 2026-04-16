import { NextFunction, Request, Response } from 'express';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/common/utils/api-response';
import { ResponseCode } from '@/common/constants/response-codes';

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

  return ApiResponse.error(res, {
    statusCode,
    code,
    message,
    data: err.details,
    stack: err.stack,
  });
};
