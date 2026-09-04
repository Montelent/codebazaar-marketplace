"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

type Cat = { name: string; slug: string };

export default function BlogCategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/taxonomy")
      .then((r) => r.json())
      .then((d) => setCats(d.blogCategories || []));
  }, []);

  async function save(next: Cat[]) {
    setError("");
    setMsg("");
    const res = await fetch("/api/admin/taxonomy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogCategories: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setCats(next);
    setMsg("Saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog" className="text-sm text-emerald-600 hover:underline">
          ← Blog
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Blog categories</h1>
        <p className="text-sm text-slate-500">Used when writing and editing posts.</p>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="button"
          onClick={() => {
            const n = name.trim();
            if (!n) return;
            const slug = n
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            if (cats.some((c) => c.slug === slug)) return;
            save([...cats, { name: n, slug }]);
            setName("");
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <ul className="divide-y rounded-xl border bg-white">
        {cats.map((c) => (
          <li key={c.slug} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 font-mono text-xs text-slate-400">{c.slug}</span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-red-600"
              onClick={() => save(cats.filter((x) => x.slug !== c.slug))}
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
    </div>
  );
}
