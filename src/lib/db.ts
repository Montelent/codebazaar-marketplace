import { Pool, type QueryResultRow } from "pg";

function cleanDatabaseUrl(raw?: string): string {
  if (!raw) {
    throw new Error(
      "DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables (Production) and redeploy."
    );
  }
  try {
    const u = new URL(raw);
    u.searchParams.delete("channel_binding");
    if (!u.searchParams.has("sslmode")) {
      u.searchParams.set("sslmode", "require");
    }
    return u.toString();
  } catch {
    return raw.replace(/[?&]channel_binding=require/g, "").replace(/\?&/, "?");
  }
}

const globalForDb = globalThis as unknown as { __pgPool?: Pool };

function getPool(): Pool {
  if (!globalForDb.__pgPool) {
    const connectionString = cleanDatabaseUrl(process.env.DATABASE_URL);
    globalForDb.__pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
    });
  }
  return globalForDb.__pgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getPool();
  const result = await pool.query<T>(text, params);
  return { rows: result.rows, rowCount: result.rowCount ?? 0 };
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const { rows } = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function dbPing(): Promise<boolean> {
  try {
    await query("SELECT 1 AS ok");
    return true;
  } catch {
    return false;
  }
}

export { cleanDatabaseUrl };
