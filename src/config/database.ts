import { config } from '@/config/env';

export const databaseConfig = {
  connectionString: config.database.url,
};
