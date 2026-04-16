import { Request, Response, NextFunction } from 'express';
import { logger } from '@/config/logger';

// In-memory store for idempotency (Replace with Redis in production)
const idempotencyStore = new Map<string, { statusCode: number; body: any }>();

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.header('Idempotency-Key');

  if (!idempotencyKey) {
    return next();
  }

  if (idempotencyStore.has(idempotencyKey)) {
    const cachedResponse = idempotencyStore.get(idempotencyKey)!;
    logger.info(`Idempotency hit for key: ${idempotencyKey}`);
    return res.status(cachedResponse.statusCode).json(cachedResponse.body);
  }

  // Hook into response to store result
  const originalSend = res.json;
  res.json = function (body: any) {
    idempotencyStore.set(idempotencyKey, {
      statusCode: res.statusCode,
      body,
    });
    return originalSend.call(this, body);
  };

  next();
};
