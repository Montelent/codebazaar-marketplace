import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/blog";
import { stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const title = String(post.title || "");
  const content = String(post.content || "");
  const cover = post.coverImageUrl ? String(post.coverImageUrl) : "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="text-sm text-emerald-600 hover:underline">
        ← Blog
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">{title}</h1>
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="mt-6 w-full rounded-xl object-cover" />
      )}
      <div
        className="prose prose-slate mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <p className="mt-10 text-sm text-slate-400">{stripHtml(title)}</p>
    </article>
  );
}
