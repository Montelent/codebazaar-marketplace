import { Pool, type QueryResultRow } from "pg";

function cleanDatabaseUrl(raw?: string): string {
  if (!raw) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_URL) is not set. In Vercel set DATABASE_URL to the same value as POSTGRES_URL, then redeploy."
    );
  }
  // Vercel/UI paste issues: quotes, whitespace, accidental newlines
  let s = String(raw).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/\s+/g, "");

  if (!s.startsWith("postgres://") && !s.startsWith("postgresql://")) {
    throw new Error(
      "DATABASE_URL must start with postgresql:// — current value is not a valid Postgres URI"
    );
  }

  try {
    const u = new URL(s);
    u.searchParams.delete("channel_binding");
    if (!u.searchParams.has("sslmode")) {
      u.searchParams.set("sslmode", "require");
    }
    return u.toString();
  } catch {
    // Fallback strip
    return s
      .replace(/[?&]channel_binding=require/g, "")
      .replace(/\?&/, "?")
      .replace(/\?$/, "");
  }
}

function resolveDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const t = String(c).trim().replace(/^['"]|['"]$/g, "");
    if (t.startsWith("postgres")) return t;
  }
  return undefined;
}

const globalForDb = globalThis as unknown as { __pgPool?: Pool };

function getPool(): Pool {
  if (!globalForDb.__pgPool) {
    const connectionString = cleanDatabaseUrl(resolveDatabaseUrl());
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

export async function dbPing(): Promise<{ ok: boolean; error?: string }> {
  try {
    await query("SELECT 1 AS ok");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

export { cleanDatabaseUrl, resolveDatabaseUrl };
