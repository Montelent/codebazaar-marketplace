"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { CKEditorField } from "@/components/editor/ck-editor";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { PRODUCT_DETAILS, detailFromCard } from "@/lib/product-detail";

const DATE_LABELS = ["Last Update", "Created", "Published", "Updated"];

type Cat = { name: string; slug: string };
type AttrMap = Record<string, string[]>;

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const card =
    MOCK_ITEMS.find((i) => i.id === id || i.slug === id) ?? MOCK_ITEMS[0];
  const detail = PRODUCT_DETAILS[card.id] ?? detailFromCard(card);

  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [categories, setCategories] = useState<Cat[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [attrPresets, setAttrPresets] = useState<AttrMap>({});

  const [form, setForm] = useState({
    title: detail.title,
    slug: detail.slug,
    description: detail.descriptionHtml,
    regularPrice: String(detail.regularPrice),
    extendedPrice: String(detail.extendedPrice),
    salePriceRegular:
      detail.salePriceRegular != null ? String(detail.salePriceRegular) : "",
    categorySlug: detail.category.slug,
    thumbnailUrl: detail.thumbnailUrl,
    demoUrl: detail.demoUrl || "",
    isFree: Number(detail.regularPrice) === 0,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(detail.tags || []);
  const [features, setFeatures] = useState<string[]>(
    detail.features.length ? detail.features : [""]
  );
  const [attrSelected, setAttrSelected] = useState<Record<string, string[]>>({});
  const [customAttrs, setCustomAttrs] = useState<{ label: string; value: string }[]>([]);
  const [createdLabel, setCreatedLabel] = useState(detail.createdAt);
  const [updatedLabel, setUpdatedLabel] = useState(detail.lastUpdate);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/products/${id}?slug=${encodeURIComponent(card.slug)}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()).catch(() => ({ categories: [] })),
      fetch("/api/admin/taxonomy").then((r) => r.json()).catch(() => ({ tags: [], attributes: {} })),
    ])
      .then(([prod, cats, tax]) => {
        if (cancelled) return;
        setCategories(cats.categories || []);
        setAllTags(tax.tags || []);
        setAttrPresets(tax.attributes || {});

        if (prod.product) {
          const p = prod.product;
          const free = Number(p.regularPrice) <= 0;
          setForm({
            title: p.title || detail.title,
            slug: p.slug || detail.slug,
            description: p.descriptionHtml || detail.descriptionHtml,
            regularPrice: String(free ? 0 : p.regularPrice ?? detail.regularPrice),
            extendedPrice: String(free ? 0 : p.extendedPrice ?? detail.extendedPrice),
            salePriceRegular: p.salePriceRegular != null ? String(p.salePriceRegular) : "",
            categorySlug: p.category?.slug || detail.category.slug,
            thumbnailUrl: p.thumbnailUrl || detail.thumbnailUrl,
            demoUrl: p.demoUrl || "",
            isFree: free,
          });
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
            } else {
              custom.push({ label: a.label, value: a.value });
            }
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

  function toggleTag(t: string) {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function toggleAttr(label: string, value: string) {
    setAttrSelected((prev) => {
      const cur = prev[label] || [];
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
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
        id,
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
      setMsg("Saved. Refresh the product page to see changes.");
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-emerald-600 hover:underline">
          ← Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit product</h1>
        <p className="text-sm text-slate-500">
          Category, tags, browsers, framework and other attributes.
        </p>
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
            />
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
          <Field label="Thumbnail URL">
            <Input value={form.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} />
          </Field>
          <Field label="Demo URL">
            <Input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} />
          </Field>
        </section>

        <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Category</h2>
            <Link href="/admin/categories" className="text-xs text-emerald-600 hover:underline">
              Manage categories
            </Link>
          </div>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={form.categorySlug}
            onChange={(e) => set("categorySlug", e.target.value)}
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Tags</h2>
            <Link href="/admin/tags" className="text-xs text-emerald-600 hover:underline">
              Manage tags
            </Link>
          </div>
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
            {allTags.length === 0 && (
              <p className="text-xs text-slate-500">Add tags under Admin → Tags.</p>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-slate-500">
              Attributes (browsers, framework, files…)
            </h2>
            <Link href="/admin/attributes" className="text-xs text-emerald-600 hover:underline">
              Manage attributes
            </Link>
          </div>
          {Object.keys(attrPresets).length === 0 && (
            <p className="text-sm text-slate-500">
              Open Attributes to define Compatible Browsers, Framework, etc.
            </p>
          )}
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
              <Plus className="h-4 w-4" /> Add custom attribute
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
          <h2 className="text-sm font-semibold uppercase text-slate-500">Dates</h2>
          <p className="text-sm text-slate-600">
            <span className="font-medium">Created:</span> {createdLabel}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-medium">Last update:</span> {updatedLabel}
          </p>
          <p className="text-xs text-slate-400">Set automatically — not editable.</p>
        </section>

        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {msg && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
          <Link href={`/item/${form.slug}/${id}`} target="_blank">
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
