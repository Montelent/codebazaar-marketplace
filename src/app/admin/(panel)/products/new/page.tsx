"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { CKEditorField } from "@/components/editor/ck-editor";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    status: "APPROVED",
    requirements: "",
    tags: "",
  });
  const [features, setFeatures] = useState<string[]>([""]);
  const [licenseFeatures, setLicenseFeatures] = useState<string[]>([
    "Quality checked by CodeBazaar",
    "Future updates",
    "6 months support from author",
  ]);
  const [changelogText, setChangelogText] = useState("");
  const [attributes, setAttributes] = useState<{ label: string; value: string }[]>([
    { label: "Last Update", value: "" },
    { label: "High Resolution", value: "Yes" },
    { label: "Compatible Browsers", value: "" },
    { label: "Files Included", value: "" },
    { label: "Software Framework", value: "" },
    { label: "Software Version", value: "" },
  ]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function updateList(
    list: string[],
    setList: (v: string[]) => void,
    i: number,
    v: string
  ) {
    const next = [...list];
    next[i] = v;
    setList(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug,
        description: form.description,
        regularPrice: Number(form.regularPrice),
        extendedPrice: Number(form.extendedPrice),
        salePriceRegular: form.salePriceRegular
          ? Number(form.salePriceRegular)
          : null,
        categorySlug: form.categorySlug,
        thumbnailUrl: form.thumbnailUrl || undefined,
        demoUrl: form.demoUrl || undefined,
        status: form.status,
        features: features.filter((f) => f.trim()),
        licenseFeatures: licenseFeatures.filter((f) => f.trim()),
        requirements: form.requirements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        tags: form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        attributes: attributes.filter((a) => a.label.trim() && a.value.trim()),
        changelog: changelogText,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(
        data.hint || (typeof data.error === "string" ? data.error : "Failed")
      );
      return;
    }
    router.push("/admin/products");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-emerald-600 hover:underline"
        >
          ← Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Add product</h1>
        <p className="text-sm text-slate-500">
          CodeCanyon-style · features, attributes, changelog, rich description
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Basics
          </h2>
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
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              required
            />
          </Field>
          <Field label="Description (CKEditor)">
            <CKEditorField
              value={form.description}
              onChange={(html) => set("description", html)}
              minHeight={260}
              placeholder="Full product description…"
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Regular $">
              <Input
                type="number"
                step="0.01"
                value={form.regularPrice}
                onChange={(e) => set("regularPrice", e.target.value)}
                required
              />
            </Field>
            <Field label="Extended $">
              <Input
                type="number"
                step="0.01"
                value={form.extendedPrice}
                onChange={(e) => set("extendedPrice", e.target.value)}
                required
              />
            </Field>
            <Field label="Sale regular $">
              <Input
                type="number"
                step="0.01"
                value={form.salePriceRegular}
                onChange={(e) => set("salePriceRegular", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Category slug">
            <Input
              value={form.categorySlug}
              onChange={(e) => set("categorySlug", e.target.value)}
            />
          </Field>
          <Field label="Thumbnail URL">
            <Input
              value={form.thumbnailUrl}
              onChange={(e) => set("thumbnailUrl", e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Live preview URL">
            <Input
              value={form.demoUrl}
              onChange={(e) => set("demoUrl", e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <Input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="react, dashboard"
            />
          </Field>
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Product features
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeatures((f) => [...f, ""])}
            >
              <Plus className="h-4 w-4" /> Add feature
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Bullets under the description on the item page.
          </p>
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={f}
                onChange={(e) =>
                  updateList(features, setFeatures, i, e.target.value)
                }
                placeholder={`Feature ${i + 1}`}
              />
              <button
                type="button"
                className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                onClick={() =>
                  setFeatures((list) => list.filter((_, j) => j !== i))
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              License / purchase features
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLicenseFeatures((f) => [...f, ""])}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <p className="text-xs text-slate-500">Checkmarks next to the price.</p>
          {licenseFeatures.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={f}
                onChange={(e) =>
                  updateList(licenseFeatures, setLicenseFeatures, i, e.target.value)
                }
              />
              <button
                type="button"
                className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                onClick={() =>
                  setLicenseFeatures((list) => list.filter((_, j) => j !== i))
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Requirements
          </h2>
          <CKEditorField
            value={form.requirements}
            onChange={(html) => set("requirements", html)}
            minHeight={120}
            placeholder="One requirement per line"
          />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            ChangeLogs
          </h2>
          <CKEditorField
            value={changelogText}
            onChange={setChangelogText}
            minHeight={160}
            placeholder="Version 1.2 — [UPDATED] …"
          />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Item attributes
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setAttributes((a) => [...a, { label: "", value: "" }])
              }
            >
              <Plus className="h-4 w-4" /> Add attribute
            </Button>
          </div>
          {attributes.map((a, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                placeholder="Label"
                value={a.label}
                onChange={(e) => {
                  const next = [...attributes];
                  next[i] = { ...next[i], label: e.target.value };
                  setAttributes(next);
                }}
              />
              <Input
                placeholder="Value"
                value={a.value}
                onChange={(e) => {
                  const next = [...attributes];
                  next[i] = { ...next[i], value: e.target.value };
                  setAttributes(next);
                }}
              />
              <button
                type="button"
                className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                onClick={() =>
                  setAttributes((list) => list.filter((_, j) => j !== i))
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>

        {error && (
          <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Publish product"}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
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
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
