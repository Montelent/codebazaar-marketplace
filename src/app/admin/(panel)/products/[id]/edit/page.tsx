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

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const card = MOCK_ITEMS.find((i) => i.id === id || i.slug === id) ?? MOCK_ITEMS[0];
  const detail = PRODUCT_DETAILS[card.id] ?? detailFromCard(card);

  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
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
    status: "APPROVED",
    isFree: Number(detail.regularPrice) === 0,
    tags: detail.tags.join(", "),
  });
  const [features, setFeatures] = useState<string[]>(
    detail.features.length ? detail.features : [""]
  );
  const [createdLabel, setCreatedLabel] = useState(detail.createdAt);
  const [updatedLabel, setUpdatedLabel] = useState(detail.lastUpdate);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products/${id}?slug=${encodeURIComponent(card.slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.product) return;
        const p = data.product;
        const free = Number(p.regularPrice) <= 0;
        setForm({
          title: p.title || detail.title,
          slug: p.slug || detail.slug,
          description: p.descriptionHtml || detail.descriptionHtml,
          regularPrice: String(free ? 0 : p.regularPrice ?? detail.regularPrice),
          extendedPrice: String(free ? 0 : p.extendedPrice ?? detail.extendedPrice),
          salePriceRegular:
            p.salePriceRegular != null ? String(p.salePriceRegular) : "",
          categorySlug: p.category?.slug || detail.category.slug,
          thumbnailUrl: p.thumbnailUrl || detail.thumbnailUrl,
          demoUrl: p.demoUrl || "",
          status: "APPROVED",
          isFree: free,
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : detail.tags.join(", "),
        });
        if (Array.isArray(p.features) && p.features.length) {
          setFeatures(p.features);
        }
        if (p.createdAt) setCreatedLabel(p.createdAt);
        if (p.lastUpdate) setUpdatedLabel(p.lastUpdate);
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

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

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
        status: form.status,
        features: features.filter(Boolean),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error ||
            data.message ||
            `Save failed (HTTP ${res.status}). Check /api/health.`
        );
        return;
      }
      setMsg(
        data.permanent || data.ok
          ? "Saved to Supabase. Refresh the product page to see changes."
          : data.message || "Product updated"
      );
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
    return (
      <div className="p-8 text-sm text-slate-500">Loading product from database…</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-emerald-600 hover:underline">
          ← Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit product</h1>
        <p className="text-sm text-slate-500">Changes save to Supabase Postgres.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
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
            Free product (price = 0)
          </label>
          {!form.isFree && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Regular price">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.regularPrice}
                  onChange={(e) => set("regularPrice", e.target.value)}
                />
              </Field>
              <Field label="Extended price">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.extendedPrice}
                  onChange={(e) => set("extendedPrice", e.target.value)}
                />
              </Field>
              <Field label="Sale price (optional)">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.salePriceRegular}
                  onChange={(e) => set("salePriceRegular", e.target.value)}
                />
              </Field>
            </div>
          )}
          <Field label="Thumbnail URL">
            <Input
              value={form.thumbnailUrl}
              onChange={(e) => set("thumbnailUrl", e.target.value)}
            />
          </Field>
          <Field label="Demo URL">
            <Input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} />
          </Field>
          <Field label="Category slug">
            <Input
              value={form.categorySlug}
              onChange={(e) => set("categorySlug", e.target.value)}
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFeatures((f) => [...f, ""])}
          >
            <Plus className="h-4 w-4" /> Add feature
          </Button>
        </section>

        <section className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Dates (automatic)</h2>
          <p className="text-sm text-slate-600">
            <span className="font-medium">Created:</span> {createdLabel}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-medium">Last Update:</span> {updatedLabel}
          </p>
        </section>

        {error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
        {msg && (
          <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>
        )}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
