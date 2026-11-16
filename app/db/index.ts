import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as relations from "./relations";

// Reuse one pool across hot reloads in development
const globalForDb = globalThis as unknown as { pgPool?: Pool };
function createPool() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on("error", (err) => console.error("pg pool error:", err));
    return pool;
}

const pool = globalForDb.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
    globalForDb.pgPool = pool;
}

export const db = drizzle(pool, { schema: { ...schema, ...relations } });