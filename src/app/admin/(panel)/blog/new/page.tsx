"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CKEditorField } from "@/components/editor/ck-editor";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    status: "DRAFT",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      <Link href="/admin/blog" className="text-sm text-emerald-600 hover:underline">
        ← Blog
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">New blog post</h1>
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <Input
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!form.slug)
                set(
                  "slug",
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                );
            }}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Content</label>
          <CKEditorField
            value={form.content}
            onChange={(html) => set("content", html)}
            minHeight={280}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        {error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save post"}
        </Button>
      </form>
    </div>
  );
}
