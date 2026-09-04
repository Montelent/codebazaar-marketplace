"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CKEditorField } from "@/components/editor/ck-editor";
import { MediaField } from "@/components/admin/media-field";

type Cat = { name: string; slug: string };

export default function NewBlogPostPage() {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [form, setForm] = useState({
    title: "", slug: "", content: "", status: "DRAFT", excerpt: "",
    categorySlug: "", coverImageUrl: "", seoTitle: "", seoDescription: "", seoKeywords: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/admin/taxonomy").then((r) => r.json()).then((d) => {
      const list = d.blogCategories || [];
      setCats(list);
      if (list[0]) set("categorySlug", list[0].slug);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Failed");
      return;
    }
    if (data.post?.id) router.push(`/admin/blog/${data.post.id}/edit`);
    else router.push("/admin/blog");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/blog" className="text-sm text-emerald-600 hover:underline">← Blog</Link>
        <Link href="/admin/blog/categories" className="text-xs text-emerald-600 hover:underline">Manage categories</Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">New blog post</h1>
      <form onSubmit={submit} className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Content</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input value={form.title} onChange={(e) => {
              set("title", e.target.value);
              if (!form.slug) set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
            }} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)}>
              <option value="">— Select —</option>
              {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Excerpt</label>
            <Input value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Short summary" />
          </div>
          <MediaField label="Cover image" value={form.coverImageUrl} onChange={(v) => set("coverImageUrl", v)} help="External URL or upload" />
          <div>
            <label className="mb-1 block text-sm font-medium">Content</label>
            <CKEditorField value={form.content} onChange={(html) => set("content", html)} minHeight={280} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </section>
        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">SEO</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">SEO title</label>
            <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Defaults to post title" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Meta description</label>
            <Input value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder="150–160 characters" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Keywords</label>
            <Input value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} placeholder="comma, separated" />
          </div>
        </section>
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save post"}</Button>
      </form>
    </div>
  );
}
