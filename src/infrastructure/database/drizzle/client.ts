import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { databaseConfig } from '../../../config/database';

const pool = new Pool({
  connectionString: databaseConfig.connectionString,
});

export const db = drizzle(pool, { schema });
