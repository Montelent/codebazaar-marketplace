import { NextResponse } from "next/server";
import {
  dbPing,
  query,
  resolveDatabaseUrl,
  diagnoseDatabaseUrl,
  cleanDatabaseUrl,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = resolveDatabaseUrl();
  const diag = diagnoseDatabaseUrl(raw);

  let cleanedOk = false;
  let cleanError: string | undefined;
  let hostHint: string | null = null;
  try {
    if (raw) {
      const cleaned = cleanDatabaseUrl(raw);
      cleanedOk = true;
      const hostMatch = cleaned.match(/@([^/?]+)/);
      hostHint = hostMatch?.[1] ?? null;
    }
  } catch (e) {
    cleanError = e instanceof Error ? e.message : "clean failed";
  }

  let tables: string[] = [];
  const ping = cleanedOk ? await dbPing() : { ok: false, error: cleanError || "no url" };

  if (ping.ok) {
    try {
      const { rows } = await query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`
      );
      tables = rows.map((r) => r.tablename);
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({
    databaseUrlConfigured: Boolean(raw),
    hostHint,
    urlDiagnostics: diag,
    cleanedOk,
    envKeysPresent: {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
      POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
    },
    postgresConnected: ping.ok,
    tables,
    error: ping.error || cleanError,
    engine: "pg (no Prisma)",
    tip:
      !diag.startsWithPostgres
        ? "DATABASE_URL does not start with postgresql:// — re-copy URI from Supabase → Settings → Database → Connection string (URI)."
        : !ping.ok
          ? "URL shape looks closer; check password special characters or use Transaction pooler port 6543."
          : undefined,
  });
}
