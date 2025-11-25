import { drizzle } from 'drizzle-orm/neon-http';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Prevent multiple instances in development due to hot reloading
const globalForDb = globalThis as unknown as {
  sql: NeonQueryFunction<false, false> | undefined;
};

const sql = globalForDb.sql ?? neon(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema });
