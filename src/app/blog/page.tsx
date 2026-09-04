import Link from "next/link";
import { listPublishedBlogPosts } from "@/lib/blog";
import { stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog" };

export default async function BlogIndexPage() {
  const posts = await listPublishedBlogPosts(24);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
      <p className="mt-2 text-slate-600">News, guides, and product updates.</p>
      {posts.length === 0 ? (
        <p className="mt-10 text-sm text-slate-500">No published posts yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              {p.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImageUrl} alt="" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-400">
                  Blog
                </div>
              )}
              <div className="p-4">
                {p.categorySlug && (
                  <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    {p.categorySlug}
                  </span>
                )}
                <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{stripHtml(p.excerpt)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
