import { Pool, type QueryResultRow } from "pg";

function stripWrappingQuotes(s: string): string {
  let t = s.trim();
  // repeated quote stripping
  for (let i = 0; i < 3; i++) {
    if (
      (t.startsWith('"') && t.endsWith('"')) ||
      (t.startsWith("'") && t.endsWith("'"))
    ) {
      t = t.slice(1, -1).trim();
    } else break;
  }
  return t;
}

/**
 * Normalize a Postgres connection string from Vercel/Supabase env paste issues.
 */
export function cleanDatabaseUrl(raw?: string): string {
  if (!raw) {
    throw new Error(
      "DATABASE_URL / POSTGRES_URL missing. Set DATABASE_URL in Vercel to a postgresql:// URI."
    );
  }

  let s = stripWrappingQuotes(String(raw));
  // remove BOM / zero-width / newlines / tabs
  s = s.replace(/^\uFEFF/, "").replace(/[\r\n\t]+/g, "").trim();
  s = stripWrappingQuotes(s);

  // If someone pasted KEY=value
  if (/^(DATABASE_URL|POSTGRES_URL|POSTGRES_PRISMA_URL)=/i.test(s)) {
    s = s.replace(/^[^=]+=/, "");
    s = stripWrappingQuotes(s);
  }

  // Sometimes integration stores a JSON string
  if (s.startsWith("{")) {
    try {
      const j = JSON.parse(s) as Record<string, string>;
      s =
        j.DATABASE_URL ||
        j.POSTGRES_URL ||
        j.uri ||
        j.connectionString ||
        s;
      s = stripWrappingQuotes(String(s));
    } catch {
      /* ignore */
    }
  }

  if (!/^postgres(ql)?:\/\//i.test(s)) {
    throw new Error(
      "DATABASE_URL must start with postgresql:// (got something else — re-copy from Supabase Database settings)"
    );
  }

  // Ensure sslmode; drop channel_binding without full URL parse if password has special chars
  s = s.replace(/[?&]channel_binding=require/gi, "");
  if (!/[?&]sslmode=/i.test(s)) {
    s += s.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }
  // tidy ?&
  s = s.replace(/\?&/, "?").replace(/&&+/g, "&");

  return s;
}

export function resolveDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const t = stripWrappingQuotes(String(c)).replace(/[\r\n\t]+/g, "");
    if (/^postgres(ql)?:\/\//i.test(t) || t.startsWith("{")) return c;
  }
  // return first non-empty for diagnostics
  return candidates.find((c) => c && String(c).trim()) as string | undefined;
}

/** Safe diagnostics — never returns password */
export function diagnoseDatabaseUrl(raw?: string): {
  length: number;
  startsWithPostgres: boolean;
  hasWhitespace: boolean;
  hasQuotes: boolean;
  hasNewline: boolean;
  prefix: string;
  looksLikeJson: boolean;
} {
  const s = raw == null ? "" : String(raw);
  return {
    length: s.length,
    startsWithPostgres: /^[\s"']*postgres(ql)?:\/\//i.test(s),
    hasWhitespace: /\s/.test(s.trim()),
    hasQuotes: /^["']/.test(s.trim()) || /["']$/.test(s.trim()),
    hasNewline: /[\r\n]/.test(s),
    prefix: s.trim().slice(0, 24).replace(/:[^:@/]+@/, ":***@"),
    looksLikeJson: s.trim().startsWith("{"),
  };
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
