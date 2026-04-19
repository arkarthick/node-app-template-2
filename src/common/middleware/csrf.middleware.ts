import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/env';
import { ApiResponse } from '@/common/utils/api-response';
import { ResponseCode } from '@/common/constants/response-codes';

const doubleCsrfConfig = doubleCsrf({
  getSecret: () => config.app.csrfSecret || 'default-secret-change-me',
  cookieName: config.nodeEnv === 'production' ? '__Host-ps-csrf' : 'ps-csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: config.nodeEnv === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'],
  getSessionIdentifier: (req: Request) => {
    // For stateless APIs, we can use the IP address or any unique request property
    // that doesn't rely on server-side sessions.
    return req.ip || 'stateless-session';
  },
});

export const generateToken = (req: Request, res: Response) =>
  doubleCsrfConfig.generateCsrfToken(req, res);
const invalidCsrfTokenError = doubleCsrfConfig.invalidCsrfTokenError;

/**
 * CSRF Protection Middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (!config.app.csrfEnable) {
    return next();
  }
  return doubleCsrfConfig.doubleCsrfProtection(req, res, next);
};

/**
 * CSRF Error Handler Middleware
 */
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err === invalidCsrfTokenError) {
    return ApiResponse.error(res, {
      message: 'Invalid CSRF token',
      statusCode: 403,
      code: ResponseCode.FORBIDDEN,
    });
  }
  next(err);
};
