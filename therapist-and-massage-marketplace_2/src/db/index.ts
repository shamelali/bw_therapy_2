import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

// Creating a Pool does not connect to PostgreSQL. Keep module evaluation safe during
// `next build`, where route handlers can be imported without runtime environment
// variables. Database-backed requests still require DATABASE_URL at runtime; without
// it, pg will report the connection failure when a query is attempted.

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
