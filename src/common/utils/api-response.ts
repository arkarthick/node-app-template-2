import { Response } from 'express';
import { ResponseCode } from '../constants/response-codes';

export interface ApiResponseOptions<T> {
  statusCode: number;
  code: ResponseCode | string;
  message: string;
  data?: T;
}

export class ApiResponse {
  static send<T>(res: Response, options: ApiResponseOptions<T>) {
    const { statusCode, code, message, data } = options;
    
    // Determine status string based on status code
    const status = statusCode >= 200 && statusCode < 300 ? 'success' : 'error';

    return res.status(statusCode).json({
      statusCode,
      code,
      status,
      message,
      data: data || {},
    });
  }

  static success<T>(res: Response, options: { data: T; message?: string; statusCode?: number; code?: ResponseCode | string }) {
    const { data, message = 'Success', statusCode = 200, code = ResponseCode.SUCCESS } = options;
    return this.send(res, {
      statusCode,
      code,
      message,
      data,
    });
  }

  static error(res: Response, options: { message: string; statusCode?: number; code?: ResponseCode | string; data?: any }) {
    const { message, statusCode = 500, code = ResponseCode.INTERNAL_SERVER_ERROR, data } = options;
    return this.send(res, {
      statusCode,
      code,
      message,
      data,
    });
  }
}
