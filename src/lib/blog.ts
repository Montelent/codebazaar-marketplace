import { query } from "@/lib/db";

export type BlogCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  categorySlug: string | null;
  updatedAt: string | null;
  createdAt: string | null;
};

export async function listPublishedBlogPosts(limit = 6): Promise<BlogCard[]> {
  try {
    const { rows } = await query<{
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      coverImageUrl: string | null;
      categorySlug: string | null;
      updatedAt: Date | string | null;
      createdAt: Date | string | null;
      content: string | null;
    }>(
      `SELECT id, title, slug, excerpt, "coverImageUrl", "categorySlug", "updatedAt", "createdAt", content
       FROM "BlogPost"
       WHERE status = 'PUBLISHED'
       ORDER BY "updatedAt" DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt:
        r.excerpt ||
        (r.content
          ? String(r.content)
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 140)
          : null),
      coverImageUrl: r.coverImageUrl,
      categorySlug: r.categorySlug,
      updatedAt: r.updatedAt ? String(r.updatedAt) : null,
      createdAt: r.createdAt ? String(r.createdAt) : null,
    }));
  } catch {
    try {
      const { rows } = await query<{
        id: string;
        title: string;
        slug: string;
        content: string | null;
        updatedAt: Date | string | null;
        createdAt: Date | string | null;
      }>(
        `SELECT id, title, slug, content, "updatedAt", "createdAt"
         FROM "BlogPost"
         WHERE status = 'PUBLISHED'
         ORDER BY "updatedAt" DESC NULLS LAST
         LIMIT $1`,
        [limit]
      );
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.content
          ? String(r.content)
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 140)
          : null,
        coverImageUrl: null,
        categorySlug: null,
        updatedAt: r.updatedAt ? String(r.updatedAt) : null,
        createdAt: r.createdAt ? String(r.createdAt) : null,
      }));
    } catch {
      return [];
    }
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const { rows } = await query(
      `SELECT * FROM "BlogPost" WHERE slug = $1 AND status = 'PUBLISHED' LIMIT 1`,
      [slug]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}
