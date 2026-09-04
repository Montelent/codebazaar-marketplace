import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public list of CMS pages for menus */
export async function GET() {
  try {
    const { rows } = await query<{ title: string; slug: string }>(
      `SELECT title, slug FROM "CmsPage" ORDER BY title ASC LIMIT 100`
    );
    return NextResponse.json({
      pages: rows.map((r) => ({
        title: r.title,
        slug: r.slug,
        href: `/page/${r.slug}`,
      })),
    });
  } catch {
    return NextResponse.json({ pages: [] });
  }
}
