"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { CKEditorField } from "@/components/editor/ck-editor";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { PRODUCT_DETAILS, detailFromCard } from "@/lib/product-detail";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const card = MOCK_ITEMS.find((i) => i.id === id) ?? MOCK_ITEMS[0];
  const detail = PRODUCT_DETAILS[card.id] ?? detailFromCard(card);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    title: detail.title,
    slug: detail.slug,
    description: detail.descriptionHtml,
    regularPrice: String(detail.regularPrice),
    extendedPrice: String(detail.extendedPrice),
    salePriceRegular: detail.salePriceRegular != null ? String(detail.salePriceRegular) : "",
    categorySlug: detail.category.slug,
    thumbnailUrl: detail.thumbnailUrl,
    demoUrl: detail.demoUrl || "",
    status: "APPROVED",
    isFree: Number(detail.regularPrice) === 0,
    tags: detail.tags.join(", "),
  });
  const [features, setFeatures] = useState<string[]>(detail.features.length ? detail.features : [""]);
  const [licenseFeatures, setLicenseFeatures] = useState<string[]>(
    detail.licenseFeatures.length ? detail.licenseFeatures : ["Quality checked by CodeBazaar", "Future updates"]
  );
  const [requirements, setRequirements] = useState(
    "<ul>" + detail.requirements.map((r) => `<li>${r}</li>`).join("") + "</ul>"
  );
  const [changelogText, setChangelogText] = useState(
    detail.changelogs.map((c) => `<p><strong>Version ${c.version}</strong></p><ul>${c.items.map((i) => `<li>${i}</li>`).join("")}</ul>`).join("")
  );
  const [attributes, setAttributes] = useState(
    detail.attributes.length ? detail.attributes : [{ label: "Last Update", value: "" }]
  );

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setMsg("");
    const res = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        ...form,
        regularPrice: form.isFree ? 0 : Number(form.regularPrice),
        extendedPrice: form.isFree ? 0 : Number(form.extendedPrice),
        salePriceRegular: form.salePriceRegular ? Number(form.salePriceRegular) : null,
        features: features.filter((f) => f.trim()),
        licenseFeatures: licenseFeatures.filter((f) => f.trim()),
        requirements,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        attributes: attributes.filter((a) => a.label.trim()),
        changelog: changelogText,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.hint || data.error || "Save failed"); return; }
    setMsg("Product updated");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-emerald-600 hover:underline">← Products</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit product</h1>
        <p className="text-sm text-slate-500">{detail.title}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Basics</h2>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.isFree} onChange={(e) => set("isFree", e.target.checked)} className="accent-emerald-600" />
            Free product (no payment required)
          </label>
          <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} required /></Field>
          <Field label="Slug"><Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required /></Field>
          <Field label="Description (CKEditor)">
            <CKEditorField value={form.description} onChange={(html) => set("description", html)} minHeight={280} />
          </Field>
          {!form.isFree && (
            <div className="grid grid-cols-3 gap-4">
              <Field label="Regular $"><Input type="number" step="0.01" value={form.regularPrice} onChange={(e) => set("regularPrice", e.target.value)} /></Field>
              <Field label="Extended $"><Input type="number" step="0.01" value={form.extendedPrice} onChange={(e) => set("extendedPrice", e.target.value)} /></Field>
              <Field label="Sale $"><Input type="number" step="0.01" value={form.salePriceRegular} onChange={(e) => set("salePriceRegular", e.target.value)} /></Field>
            </div>
          )}
          <Field label="Thumbnail URL"><Input value={form.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} /></Field>
          <Field label="Demo URL"><Input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} /></Field>
          <Field label="Tags"><Input value={form.tags} onChange={(e) => set("tags", e.target.value)} /></Field>
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Features</h2>
            <Button type="button" variant="outline" onClick={() => setFeatures((f) => [...f, ""])}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input value={f} onChange={(e) => { const n = [...features]; n[i] = e.target.value; setFeatures(n); }} />
              <button type="button" className="rounded border p-2" onClick={() => setFeatures((list) => list.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-slate-500">License features</h2>
            <Button type="button" variant="outline" onClick={() => setLicenseFeatures((f) => [...f, ""])}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {licenseFeatures.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input value={f} onChange={(e) => { const n = [...licenseFeatures]; n[i] = e.target.value; setLicenseFeatures(n); }} />
              <button type="button" className="rounded border p-2" onClick={() => setLicenseFeatures((list) => list.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Requirements</h2>
          <CKEditorField value={requirements} onChange={setRequirements} minHeight={140} />
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">ChangeLogs</h2>
          <CKEditorField value={changelogText} onChange={setChangelogText} minHeight={160} />
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Attributes</h2>
            <Button type="button" variant="outline" onClick={() => setAttributes((a) => [...a, { label: "", value: "" }])}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {attributes.map((a, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input placeholder="Label" value={a.label} onChange={(e) => { const n = [...attributes]; n[i] = { ...n[i], label: e.target.value }; setAttributes(n); }} />
              <Input placeholder="Value" value={a.value} onChange={(e) => { const n = [...attributes]; n[i] = { ...n[i], value: e.target.value }; setAttributes(n); }} />
              <button type="button" className="rounded border p-2" onClick={() => setAttributes((list) => list.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button>
            </div>
          ))}
        </section>

        {error && <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>}
        {msg && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save changes"}</Button>
          <Link href="/admin/products"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
