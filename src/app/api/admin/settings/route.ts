import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getAllSettings, setSettings } from "@/lib/settings";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getAllSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const settings = body.settings as Record<string, unknown>;
  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "settings object required" }, { status: 400 });
  }

  try {
    const keys = await setSettings(settings);
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/api/settings");
    return NextResponse.json({
      ok: true,
      permanent: true,
      saved: keys.length,
      message: "Settings saved to database and homepage refreshed",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    console.error("Settings save failed:", message);
    return NextResponse.json(
      {
        error: message,
        permanent: false,
        hint: "DATABASE_URL missing on Vercel or SiteSetting table issue",
      },
      { status: 503 }
    );
  }
}
