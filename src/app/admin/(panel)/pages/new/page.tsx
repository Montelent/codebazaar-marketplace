"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function NewCmsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", slug: "", content: "", status: "PUBLISHED", seoTitle: "", showInFooter: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : data.hint || "Failed");
      return;
    }
    router.push("/admin/pages");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/pages" className="text-sm text-emerald-600 hover:underline">← Pages</Link>
      <h1 className="text-2xl font-bold">New page</h1>
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div><label className="mb-1 block text-sm font-medium">Title</label>
          <Input value={form.title} onChange={(e) => {
            set("title", e.target.value);
            if (!form.slug) set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
          }} required /></div>
        <div><label className="mb-1 block text-sm font-medium">Slug</label>
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required /></div>
        <div><label className="mb-1 block text-sm font-medium">Content</label>
          <textarea className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm" rows={12} value={form.content} onChange={(e) => set("content", e.target.value)} required /></div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.showInFooter} onChange={(e) => set("showInFooter", e.target.checked)} className="accent-emerald-600" />
          Show in footer
        </label>
        {error && <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save page"}</Button>
      </form>
    </div>
  );
}
