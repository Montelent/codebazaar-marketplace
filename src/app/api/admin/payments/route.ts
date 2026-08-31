import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await prisma.paymentMethod.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({
      methods: rows.map((r) => ({
        id: r.id,
        provider: r.provider,
        name: r.name,
        enabled: r.enabled,
        isManual: r.isManual,
        instructions: r.instructions,
        config: r.config,
        secrets: r.secrets,
      })),
    });
  } catch {
    return NextResponse.json({ methods: [] });
  }
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const methods = body.methods as Array<{
    provider: string; name: string; enabled: boolean; isManual: boolean;
    instructions?: string; config?: object; secrets?: object;
  }>;
  try {
    const saved = [];
    for (let i = 0; i < methods.length; i++) {
      const m = methods[i];
      const row = await prisma.paymentMethod.upsert({
        where: { provider_name: { provider: m.provider as "STRIPE", name: m.name } },
        update: {
          enabled: m.enabled, isManual: m.isManual, instructions: m.instructions,
          config: m.config ?? {}, secrets: m.secrets ?? {}, sortOrder: i,
        },
        create: {
          provider: m.provider as "STRIPE", name: m.name, enabled: m.enabled,
          isManual: m.isManual, instructions: m.instructions,
          config: m.config ?? {}, secrets: m.secrets ?? {}, sortOrder: i,
        },
      });
      saved.push(row);
    }
    return NextResponse.json({ methods: saved });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error", hint: "Run npx prisma db push so PaymentMethod table exists" },
      { status: 503 }
    );
  }
}
