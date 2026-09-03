import { NextResponse } from "next/server";
import { dbPing, query, resolveDatabaseUrl } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = resolveDatabaseUrl();
  const hasUrl = Boolean(raw);
  let tables: string[] = [];
  const ping = await dbPing();
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
    databaseUrlConfigured: hasUrl,
    envKeysPresent: {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
      POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
    },
    postgresConnected: ping.ok,
    tables,
    error: ping.error,
    engine: "pg (no Prisma)",
  });
}
