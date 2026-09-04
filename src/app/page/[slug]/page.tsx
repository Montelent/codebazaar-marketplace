import { notFound } from "next/navigation";
import { queryOne, query } from "@/lib/db";
import type { Metadata } from "next";
import { stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getPage(slug: string) {
  try {
    let row = await queryOne<{
      title: string;
      slug: string;
      content: string;
      status: string;
    }>(
      `SELECT title, slug, content, status::text AS status FROM "CmsPage" WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (row) return row;
    const { rows } = await query<{
      title: string;
      slug: string;
      content: string;
      status: string;
    }>(
      `SELECT title, slug, content, status::text AS status FROM "CmsPage"
       WHERE slug ILIKE $1 OR slug ILIKE $2
       ORDER BY "updatedAt" DESC LIMIT 1`,
      [slug, `%${slug}%`]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (page) return { title: page.title };
  return { title: slug };
}

export default async function CmsPublicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (page && page.content != null) {
    const status = String(page.status || "").toUpperCase();
    const html = page.content.trim()
      ? page.content
      : `<p>${stripHtml(page.title)}</p>`;
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900">{page.title}</h1>
        {status === "DRAFT" && (
          <p className="mt-2 text-xs text-amber-600">Draft — visible for preview</p>
        )}
        <article
          className="prose prose-slate mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  notFound();
}
