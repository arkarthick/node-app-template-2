import { db } from '../infrastructure/database/drizzle/client';
import { logger } from '../config/logger';
import { sql } from 'drizzle-orm';

export const initDb = async () => {
  try {
    // Health check query
    await db.execute(sql`SELECT 1`);
    logger.info('Database connection initialized successfully');
  } catch (error) {
    logger.error(error, 'Failed to initialize database connection');
    throw error;
  }
};
