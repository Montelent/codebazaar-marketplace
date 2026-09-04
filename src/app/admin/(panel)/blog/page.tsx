"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  categorySlug?: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-500">Posts, categories, and SEO</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/categories">
            <Button variant="outline">Categories</Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button>
              <Plus className="h-4 w-4" /> Add post
            </Button>
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">No posts yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-400">
                    /{p.slug}
                    {p.categorySlug ? ` · ${p.categorySlug}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{p.status}</span>
                  <Link href={`/admin/blog/${p.id}/edit`} className="text-xs font-medium text-emerald-600 hover:underline">
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
