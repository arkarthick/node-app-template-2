import { Request, Response, NextFunction } from 'express';
import { authService } from '../../modules/auth/v1/auth.service';
import { AppError } from './error.middleware';
import { requestContextStore } from './request-context.middleware';

/**
 * Middleware to verify JWT and attach user to request/context
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authentication required') as AppError;
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const error = new Error('Invalid token format') as AppError;
      error.statusCode = 401;
      throw error;
    }
    const payload = authService.verifyAccessToken(token);

    // Attach user to request (for convenience)
    (req as any).user = payload;

    // Attach user to AsyncLocalStorage context
    const context = requestContextStore.getStore();
    if (context) {
      context.userId = payload.sub;
    }

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expired') as AppError;
      err.statusCode = 401;
      return next(err);
    }
    const err = new Error('Invalid token') as AppError;
    err.statusCode = 401;
    next(err);
  }
};
