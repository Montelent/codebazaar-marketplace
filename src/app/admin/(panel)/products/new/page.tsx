"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { CKEditorField } from "@/components/editor/ck-editor";

type Cat = { name: string; slug: string };
type AttrMap = Record<string, string[]>;

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Cat[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [attrPresets, setAttrPresets] = useState<AttrMap>({});

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    regularPrice: "49",
    extendedPrice: "249",
    salePriceRegular: "",
    categorySlug: "javascript",
    thumbnailUrl: "",
    demoUrl: "",
    isFree: false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [attrSelected, setAttrSelected] = useState<Record<string, string[]>>({});
  const [customAttrs, setCustomAttrs] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()).catch(() => ({ categories: [] })),
      fetch("/api/admin/taxonomy").then((r) => r.json()).catch(() => ({ tags: [], attributes: {} })),
    ]).then(([cats, tax]) => {
      setCategories(cats.categories || []);
      setAllTags(tax.tags || []);
      setAttrPresets(tax.attributes || {});
      if (cats.categories?.[0]?.slug) {
        setForm((f) => ({ ...f, categorySlug: f.categorySlug || cats.categories[0].slug }));
      }
    });
  }, []);

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
    try {
      const slug =
        form.slug ||
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      const body = {
        id: slug,
        title: form.title,
        slug,
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
        thumbnailUrl: form.thumbnailUrl || undefined,
        demoUrl: form.demoUrl || undefined,
        features: features.filter(Boolean),
        tags: selectedTags,
        attributes: buildAttributes(),
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.message || `Save failed (${res.status})`);
        return;
      }
      const editId = data.item?.id || data.id || slug;
      router.push(`/admin/products/${editId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-emerald-600 hover:underline">
          ← Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Add product</h1>
        <p className="text-sm text-slate-500">
          Same options as editing — category, tags, browsers, framework, features.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Basics</h2>
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!form.slug) {
                  set(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                  );
                }
              }}
              required
            />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          </Field>
          <Field label="Description">
            <CKEditorField
              value={form.description}
              onChange={(v) => set("description", v)}
              minHeight={200}
            />
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

        {error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Create product"}
        </Button>
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
