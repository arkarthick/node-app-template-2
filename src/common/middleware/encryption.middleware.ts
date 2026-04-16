import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/env';
import { CryptoUtil } from '@/common/utils/crypto.util';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/common/utils/api-response';
import { ResponseCode } from '@/common/constants/response-codes';

export const encryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!config.app.encrypt) {
    return next();
  }

  // Exclude specific routes from encryption (e.g., health check, csrf token)
  const excludedRoutes = ['/health', '/csrf-token'];
  if (excludedRoutes.some(route => req.path.endsWith(route))) {
    return next();
  }

  // 1. Decrypt incoming request body if it's encrypted
  if (req.body && typeof req.body === 'object' && req.body.data) {
    try {
      const decryptedData = CryptoUtil.decrypt(req.body.data);
      req.body = JSON.parse(decryptedData);
      logger.debug('Request body decrypted successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to decrypt request body');
      return ApiResponse.error(res, {
        message: 'Invalid encrypted data',
        statusCode: 400,
        code: ResponseCode.BAD_REQUEST,
      });
    }
  }

  // 2. Hook into res.json to encrypt outgoing response
  const originalJson = res.json;

  res.json = function (body: any): Response {
    if (config.app.encrypt && body && typeof body === 'object') {
      try {
        const jsonString = JSON.stringify(body);
        const encryptedData = CryptoUtil.encrypt(jsonString);
        
        res.setHeader('x-api-encrypted', 'true');
        
        // Wrap the encrypted data in the standard format
        return originalJson.call(this, { data: encryptedData });
      } catch (error) {
        logger.error({ error }, 'Failed to encrypt response body');
        // If encryption fails, we should probably still send the original response 
        // but log the failure, or send an error. 
        // Safety first: send the original to avoid breaking the app, 
        // but in a strict production env, you might want to send a 500.
      }
    }
    return originalJson.call(this, body);
  };

  next();
};
