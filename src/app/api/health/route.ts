import { NextResponse } from "next/server";
import { dbPing, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = Boolean(process.env.DATABASE_URL);
  let ok = false;
  let tables: string[] = [];
  let error: string | undefined;
  try {
    ok = await dbPing();
    if (ok) {
      const { rows } = await query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`
      );
      tables = rows.map((r) => r.tablename);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "unknown";
  }
  return NextResponse.json({
    databaseUrlConfigured: hasUrl,
    postgresConnected: ok,
    tables,
    error,
    engine: "pg (no Prisma)",
  });
}
