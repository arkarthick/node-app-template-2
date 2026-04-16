import { AsyncLocalStorage } from 'node:async_hooks';
import { NextFunction, Request, Response } from 'express';

export interface RequestContext {
  userId?: string | undefined;
  requestId: string;
  ipAddress: string;
  userAgent?: string | undefined;
}

export const requestContextStore = new AsyncLocalStorage<RequestContext>();

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  const context: RequestContext = {
    requestId,
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'],
    userId: undefined, // Will be set by auth middleware later if needed
  };

  res.setHeader('x-request-id', requestId);

  requestContextStore.run(context, () => {
    next();
  });
};

export const getRequestContext = (): RequestContext | undefined => {
  return requestContextStore.getStore();
};
