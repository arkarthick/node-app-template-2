import { createApp } from '@/app';
import { config } from '@/config/env';
import { logger } from '@/config/logger';
import { initDb } from '@/loaders/db.loader';

const startServer = async () => {
  try {
    // 1. Initialize Infrastructure
    await initDb();

    // 2. Create Application
    const app = createApp();

    // 3. Start Listening
    const server = app.listen(config.app.port, () => {
      logger.info({ port: config.app.port, env: config.nodeEnv }, 'Server started and listening');
    });

    // Graceful Shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
