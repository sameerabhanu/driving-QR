import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Reuse the underlying HTTP connection across requests (recommended for serverless).
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

/**
 * Retries a DB operation up to `attempts` times on Neon cold-start failures
 * ("fetch failed" / ECONNREFUSED). The database wakes within ~2-4 s.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 2000,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isColdStart = msg.includes("fetch failed") || msg.includes("ECONNREFUSED");
      if (!isColdStart || i === attempts - 1) throw err;
      lastErr = err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}
