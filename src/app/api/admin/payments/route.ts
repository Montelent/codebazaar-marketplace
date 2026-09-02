import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getAllSettings, setSettings } from "@/lib/settings";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = await getAllSettings();
  return NextResponse.json({
    stripeEnabled: s["payments.stripeEnabled"] ?? false,
    manualEnabled: s["payments.manualEnabled"] ?? true,
    manualInstructions: s["payments.manualInstructions"] ?? "",
  });
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await setSettings({
    "payments.stripeEnabled": Boolean(body.stripeEnabled),
    "payments.manualEnabled": body.manualEnabled !== false,
    "payments.manualInstructions": body.manualInstructions ?? "",
  });
  return NextResponse.json({ ok: true, permanent: true });
}
