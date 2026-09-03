import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSetting, setSettings } from "@/lib/settings";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

const DEFAULT_TAGS = [
  "react", "nextjs", "wordpress", "php", "laravel", "typescript", "admin", "dashboard", "ecommerce",
];

const DEFAULT_ATTRS: Record<string, string[]> = {
  "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge", "Opera"],
  "Software Framework": ["React", "Vue", "Angular", "Laravel", "WordPress", "Next.js"],
  "Files Included": ["JavaScript JS", "TypeScript", "CSS", "SCSS", "HTML"],
  "Software Version": ["React 18.x", "PHP 8.x", "WordPress 6.x"],
  "High Resolution": ["Yes", "No"],
};

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tags = (await getSetting("taxonomy.tags")) as string[] | undefined;
  const attrs = (await getSetting("taxonomy.attributes")) as Record<string, string[]> | undefined;
  return NextResponse.json({
    tags: Array.isArray(tags) && tags.length ? tags : DEFAULT_TAGS,
    attributes: attrs && typeof attrs === "object" && Object.keys(attrs).length ? attrs : DEFAULT_ATTRS,
  });
}

export async function PUT(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const payload: Record<string, unknown> = {};
    if (body.tags) payload["taxonomy.tags"] = body.tags;
    if (body.attributes) payload["taxonomy.attributes"] = body.attributes;
    await setSettings(payload);
    return NextResponse.json({ ok: true, permanent: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}
