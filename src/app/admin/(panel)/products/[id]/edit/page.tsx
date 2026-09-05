"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { CKEditorField } from "@/components/editor/ck-editor";
import { MediaField, ScreenshotFields } from "@/components/admin/media-field";

const DATE_LABELS = ["Last Update", "Created", "Published", "Updated"];
type Cat = { name: string; slug: string };
type AttrMap = Record<string, string[]>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [productId, setProductId] = useState(id);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [categories, setCategories] = useState<Cat[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [attrPresets, setAttrPresets] = useState<AttrMap>({});
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    regularPrice: "0",
    extendedPrice: "0",
    salePriceRegular: "",
    categorySlug: "javascript",
    thumbnailUrl: "",
    demoUrl: "",
    mainFileUrl: "",
    isFree: false,
  });
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [attrSelected, setAttrSelected] = useState<Record<string, string[]>>({});
  const [customAttrs, setCustomAttrs] = useState<{ label: string; value: string }[]>([]);
  const [createdLabel, setCreatedLabel] = useState("—");
  const [updatedLabel, setUpdatedLabel] = useState("—");

  function loadTaxonomy(categorySlug: string) {
    const q = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : "";
    return fetch(`/api/admin/taxonomy${q}`)
      .then((r) => r.json())
      .then((tax) => {
        setAllTags(tax.tags || []);
        setAttrPresets(tax.attributes || {});
        return tax;
      });
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/products/${encodeURIComponent(id)}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()).catch(() => ({ categories: [] })),
    ])
      .then(async ([prod, cats]) => {
        if (cancelled) return;
        setCategories(cats.categories || []);
        const slug = prod.product?.category?.slug || "javascript";
        const tax = await loadTaxonomy(slug);
        if (cancelled) return;
        if (prod.product) {
          const p = prod.product;
          const free = Number(p.regularPrice) <= 0;
          if (p.id) setProductId(String(p.id));
          setForm({
            title: p.title || "",
            slug: p.slug || "",
            description: p.descriptionHtml || "",
            regularPrice: String(free ? 0 : p.regularPrice ?? 0),
            extendedPrice: String(free ? 0 : p.extendedPrice ?? 0),
            salePriceRegular: p.salePriceRegular != null ? String(p.salePriceRegular) : "",
            categorySlug: slug,
            thumbnailUrl: p.thumbnailUrl || "",
            demoUrl: p.demoUrl || "",
            mainFileUrl: (p as { mainFileUrl?: string }).mainFileUrl || "",
            isFree: free,
          });
          if (Array.isArray(p.galleryUrls) && p.galleryUrls.length) setScreenshots(p.galleryUrls);
          if (Array.isArray(p.features) && p.features.length) setFeatures(p.features);
          if (Array.isArray(p.tags)) setSelectedTags(p.tags);
          if (p.createdAt) setCreatedLabel(p.createdAt);
          if (p.lastUpdate) setUpdatedLabel(p.lastUpdate);
          const presets: AttrMap = tax.attributes || {};
          const selected: Record<string, string[]> = {};
          const custom: { label: string; value: string }[] = [];
          for (const a of p.attributes || []) {
            if (DATE_LABELS.includes(a.label)) continue;
            if (presets[a.label]) {
              selected[a.label] = String(a.value)
                .split(",")
                .map((x: string) => x.trim())
                .filter(Boolean);
            } else custom.push({ label: a.label, value: a.value });
          }
          setAttrSelected(selected);
          setCustomAttrs(custom);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  function onCategoryChange(slug: string) {
    set("categorySlug", slug);
    setAttrSelected({});
    loadTaxonomy(slug);
  }
  function toggleTag(t: string) {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }
  function toggleAttr(label: string, value: string) {
    setAttrSelected((prev) => {
      const cur = prev[label] || [];
      const next = cur.includes(value)
        ? cur.filter((x) => x !== value)
        : [...cur, value];
      return { ...prev, [label]: next };
    });
  }
  function buildAttributes() {
    const out: { label: string; value: string }[] = [];
    for (const [label, vals] of Object.entries(attrSelected)) {
      if (vals.length) out.push({ label, value: vals.join(", ") });
    }
    for (const a of customAttrs) {
      if (a.label.trim() && a.value.trim()) out.push(a);
    }
    return out;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const body = {
        id: productId || id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        isFree: Boolean(form.isFree),
        regularPrice: form.isFree ? 0 : Number(form.regularPrice),
        extendedPrice: form.isFree ? 0 : Number(form.extendedPrice),
        salePriceRegular: form.isFree
          ? null
          : form.salePriceRegular
            ? Number(form.salePriceRegular)
            : null,
        categorySlug: form.categorySlug,
        thumbnailUrl: form.thumbnailUrl,
        demoUrl: form.demoUrl,
        mainFileUrl: form.mainFileUrl || undefined,
        galleryUrls: screenshots,
        features: features.filter(Boolean),
        tags: selectedTags,
        attributes: buildAttributes(),
      };
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.message || `Save failed (${res.status})`);
        return;
      }
      if (data.item?.id) setProductId(String(data.item.id));
      setMsg("Saved.");
      setUpdatedLabel(
        new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return <div className="p-8 text-sm text-slate-500">Loading product…</div>;
  }

  const viewHref = `/item/${encodeURIComponent(form.slug || id)}/${encodeURIComponent(productId || id)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-emerald-600 hover:underline">
          ← Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit product</h1>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Basics</h2>
          <Field label="Title">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          </Field>
          <Field label="Description">
            <CKEditorField value={form.description} onChange={(v) => set("description", v)} minHeight={200} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => set("isFree", e.target.checked)}
              className="accent-emerald-600"
            />{" "}
            Free product
          </label>
          {!form.isFree && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Regular price">
                <Input type="number" min={0} step="0.01" value={form.regularPrice} onChange={(e) => set("regularPrice", e.target.value)} />
              </Field>
              <Field label="Extended price">
                <Input type="number" min={0} step="0.01" value={form.extendedPrice} onChange={(e) => set("extendedPrice", e.target.value)} />
              </Field>
              <Field label="Sale price">
                <Input type="number" min={0} step="0.01" value={form.salePriceRegular} onChange={(e) => set("salePriceRegular", e.target.value)} />
              </Field>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Media & files</h2>
          <MediaField label="Thumbnail" value={form.thumbnailUrl} onChange={(v) => set("thumbnailUrl", v)} help="External URL or upload (under ~900KB)." />
          <ScreenshotFields label="Screenshots (optional)" values={screenshots} onChange={setScreenshots} />
          <Field label="Live demo URL">
            <Input type="url" value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} />
          </Field>
          <Field label="Main download file URL">
            <Input type="url" placeholder="https://…zip" value={form.mainFileUrl} onChange={(e) => set("mainFileUrl", e.target.value)} />
            <p className="mt-1 text-xs text-slate-500">Host the ZIP on storage and paste the URL.</p>
          </Field>
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Category</h2>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={form.categorySlug}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.length === 0 && (
              <option value={form.categorySlug}>{form.categorySlug}</option>
            )}
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => {
              const on = selectedTags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={
                    on
                      ? "rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white"
                      : "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Attributes for this category</h2>
          {Object.entries(attrPresets).map(([label, options]) => (
            <div key={label}>
              <p className="mb-2 text-sm font-medium text-slate-800">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                  const on = (attrSelected[label] || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleAttr(label, opt)}
                      className={
                        on
                          ? "rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white"
                          : "rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-emerald-300"
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-sm font-medium text-slate-800">Custom attributes</p>
            {customAttrs.map((a, i) => (
              <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  placeholder="Label"
                  value={a.label}
                  onChange={(e) => {
                    const n = [...customAttrs];
                    n[i] = { ...n[i], label: e.target.value };
                    setCustomAttrs(n);
                  }}
                />
                <Input
                  placeholder="Value"
                  value={a.value}
                  onChange={(e) => {
                    const n = [...customAttrs];
                    n[i] = { ...n[i], value: e.target.value };
                    setCustomAttrs(n);
                  }}
                />
                <button
                  type="button"
                  className="rounded border p-2"
                  onClick={() => setCustomAttrs((list) => list.filter((_, j) => j !== i))}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCustomAttrs((a) => [...a, { label: "", value: "" }])}
            >
              <Plus className="h-4 w-4" /> Add custom
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Features</h2>
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={f}
                onChange={(e) => {
                  const n = [...features];
                  n[i] = e.target.value;
                  setFeatures(n);
                }}
              />
              <button
                type="button"
                className="rounded border p-2"
                onClick={() => setFeatures((list) => list.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setFeatures((f) => [...f, ""])}>
            <Plus className="h-4 w-4" /> Add feature
          </Button>
        </section>

        <section className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            <span className="font-medium">Created:</span> {createdLabel}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-medium">Last update:</span> {updatedLabel}
          </p>
        </section>

        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {msg && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
          <Link href={viewHref} target="_blank">
            <Button type="button" variant="outline">
              View on site
            </Button>
          </Link>
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
