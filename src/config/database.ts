import { config } from './env';

export const databaseConfig = {
  connectionString: config.database.url,
};
