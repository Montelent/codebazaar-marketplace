"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", slug: "", description: "", regularPrice: "49", extendedPrice: "249",
    categorySlug: "javascript", thumbnailUrl: "", status: "APPROVED",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title, slug: form.slug, description: form.description,
        regularPrice: Number(form.regularPrice), extendedPrice: Number(form.extendedPrice),
        categorySlug: form.categorySlug, thumbnailUrl: form.thumbnailUrl || undefined, status: form.status,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.hint || (typeof data.error === "string" ? data.error : "Failed"));
      return;
    }
    router.push("/admin/products");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/products" className="text-sm text-emerald-600 hover:underline">← Products</Link>
      <h1 className="text-2xl font-bold">Add product</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div><label className="mb-1 block text-sm font-medium">Title</label>
          <Input value={form.title} onChange={(e) => {
            set("title", e.target.value);
            if (!form.slug) set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
          }} required /></div>
        <div><label className="mb-1 block text-sm font-medium">Slug</label>
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required /></div>
        <div><label className="mb-1 block text-sm font-medium">Description</label>
          <textarea className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="mb-1 block text-sm font-medium">Regular $</label>
            <Input type="number" step="0.01" value={form.regularPrice} onChange={(e) => set("regularPrice", e.target.value)} required /></div>
          <div><label className="mb-1 block text-sm font-medium">Extended $</label>
            <Input type="number" step="0.01" value={form.extendedPrice} onChange={(e) => set("extendedPrice", e.target.value)} required /></div>
        </div>
        <div><label className="mb-1 block text-sm font-medium">Category slug</label>
          <Input value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)} /></div>
        {error && <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Publish product"}</Button>
      </form>
    </div>
  );
}
