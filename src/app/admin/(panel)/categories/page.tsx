"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Cat = { id?: string; name: string; slug: string; description?: string | null };

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCats(data.categories || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setMsg("Category saved");
      setName("");
      setSlug("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(s: string) {
    if (!confirm(`Delete category ${s}?`)) return;
    await fetch(`/api/admin/categories?slug=${encodeURIComponent(s)}`, {
      method: "DELETE",
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500">
          Used on products and storefront filters. Stored in Supabase.
        </p>
      </div>

      <form
        onSubmit={onAdd}
        className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-4"
      >
        <Input
          placeholder="Name (e.g. WordPress)"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slug)
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")
              );
          }}
          required
        />
        <Input
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Plus className="h-4 w-4" /> Add category
        </Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <div
            key={c.slug}
            className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <h3 className="font-semibold text-slate-900">{c.name}</h3>
              <p className="font-mono text-xs text-slate-400">{c.slug}</p>
              {c.description && (
                <p className="mt-1 text-xs text-slate-500">{c.description}</p>
              )}
              <Link
                href="/admin/products"
                className="mt-2 inline-block text-xs text-emerald-600 hover:underline"
              >
                View products
              </Link>
            </div>
            <button
              type="button"
              className="rounded border p-1.5 text-slate-400 hover:text-red-600"
              onClick={() => onDelete(c.slug)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {cats.length === 0 && (
          <p className="text-sm text-slate-500">No categories in database yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
