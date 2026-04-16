import express, { Application } from 'express';
import cors from 'cors';
import { requestContextMiddleware } from '../common/middleware/request-context.middleware';
import { loggingMiddleware } from '../common/middleware/logging.middleware';
import { errorMiddleware } from '../common/middleware/error.middleware';
import { buildRoutes } from '../routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../docs/swagger';
import { config } from '../config/env';
import { ApiResponse } from '../common/utils/api-response';
import { ResponseCode } from '../common/constants/response-codes';

export const initExpress = (app: Application) => {
  // Global Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Context & Logging
  app.use(requestContextMiddleware);
  app.use(loggingMiddleware);

  // Health check
  app.get('/health', (req, res) => {
    ApiResponse.success(res, {
      data: { timestamp: new Date().toISOString() },
      message: 'Server is healthy',
    });
  });

  // Swagger Documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use('/' + config.app.basePath + '/api', buildRoutes());

  // 404 Handler
  app.use((req, res) => {
    ApiResponse.error(res, {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
      code: ResponseCode.NOT_FOUND,
    });
  });

  // Error Handling (Must be last)
  app.use(errorMiddleware);
};
