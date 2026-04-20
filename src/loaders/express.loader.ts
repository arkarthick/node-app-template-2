import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { requestContextMiddleware } from '@/common/middleware/request-context.middleware';
import { loggingMiddleware } from '@/common/middleware/logging.middleware';
import { errorMiddleware } from '@/common/middleware/error.middleware';
import { buildRoutes } from '@/routes';
import { encryptionMiddleware } from '@/common/middleware/encryption.middleware';
import {
  csrfProtection,
  generateToken,
  csrfErrorHandler,
} from '@/common/middleware/csrf.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/docs/swagger';
import { config } from '@/config/env';
import { ApiResponse } from '@/common/utils/api-response';
import { ResponseCode } from '@/common/constants/response-codes';

export const initExpress = (app: Application) => {
  // Global Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors());

  // Context, Logging & Encryption
  app.use(requestContextMiddleware);
  app.use(loggingMiddleware);

  if (config.nodeEnv === 'production') {
    app.use(encryptionMiddleware);

    if (config.app.csrfEnable) {
      app.use(csrfProtection);

      // CSRF Token endpoint
      app.get('/csrf-token', (req, res) => {
        const token = generateToken(req, res);
        ApiResponse.success(res, {
          data: { token },
          message: 'CSRF token generated successfully',
        });
      });
    }
  }

  // Health check
  app.get('/health', (req, res) => {
    ApiResponse.success(res, {
      data: { timestamp: new Date().toISOString() },
      message: 'Server is healthy',
    });
  });

  if (config.swagger.enable) {
    // Swagger Documentation
    app.use(config.swagger.path, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // Routes
  app.use('/' + config.app.basePath + 'api', buildRoutes());
  console.info('Application path: ', '/' + config.app.basePath + 'api');

  // 404 Handler
  app.use((req, res) => {
    ApiResponse.error(res, {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
      code: ResponseCode.NOT_FOUND,
    });
  });

  // Error Handling (Must be last)
  app.use(csrfErrorHandler);
  app.use(errorMiddleware);
};
