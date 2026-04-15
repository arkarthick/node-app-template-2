import express, { Application } from 'express';
import cors from 'cors';
import { requestContextMiddleware } from '../common/middleware/request-context.middleware';
import { loggingMiddleware } from '../common/middleware/logging.middleware';
import { errorMiddleware } from '../common/middleware/error.middleware';
import { buildRoutes } from '../routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../docs/swagger';

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
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Swagger Documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use('/api', buildRoutes());

  // Error Handling (Must be last)
  app.use(errorMiddleware);
};
