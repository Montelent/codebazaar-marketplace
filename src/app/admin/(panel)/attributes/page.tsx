"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, RotateCcw } from "lucide-react";
import Link from "next/link";

type AttrMap = Record<string, string[]>;
type Cat = { name: string; slug: string };

export default function AdminAttributesPage() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [categorySlug, setCategorySlug] = useState("");
  const [attrs, setAttrs] = useState<AttrMap>({});
  const [defaults, setDefaults] = useState<Record<string, AttrMap>>({});
  const [selectedAttr, setSelectedAttr] = useState("");
  const [newAttrLabel, setNewAttrLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()).catch(() => ({ categories: [] })),
      fetch("/api/admin/taxonomy").then((r) => r.json()),
    ]).then(([cats, tax]) => {
      const list: Cat[] = cats.categories || [];
      setCategories(list);
      setDefaults(tax.defaultAttributesByCategory || tax.attributesByCategory || {});
      const first = list[0]?.slug || "wordpress";
      setCategorySlug(first);
    });
  }, []);

  useEffect(() => {
    if (!categorySlug) return;
    fetch(`/api/admin/taxonomy?category=${encodeURIComponent(categorySlug)}`)
      .then((r) => r.json())
      .then((tax) => {
        const a: AttrMap = tax.attributes || {};
        setAttrs(a);
        const keys = Object.keys(a);
        setSelectedAttr(keys[0] || "");
      });
  }, [categorySlug]);

  async function save(next: AttrMap) {
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/taxonomy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug,
          categoryAttributes: next,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setAttrs(next);
      setMsg(`Saved attributes for “${categorySlug}”`);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  function addAttributeLabel() {
    const label = newAttrLabel.trim();
    if (!label) return;
    if (attrs[label]) {
      setSelectedAttr(label);
      setNewAttrLabel("");
      return;
    }
    const next = { ...attrs, [label]: [] };
    setAttrs(next);
    setSelectedAttr(label);
    setNewAttrLabel("");
    save(next);
  }

  function removeAttributeLabel(label: string) {
    const next = { ...attrs };
    delete next[label];
    const keys = Object.keys(next);
    setSelectedAttr(keys[0] || "");
    save(next);
  }

  function addValue() {
    const v = newValue.trim();
    if (!v || !selectedAttr) return;
    const list = attrs[selectedAttr] || [];
    if (list.includes(v)) {
      setNewValue("");
      return;
    }
    const next = { ...attrs, [selectedAttr]: [...list, v] };
    setNewValue("");
    save(next);
  }

  function removeValue(v: string) {
    if (!selectedAttr) return;
    const next = {
      ...attrs,
      [selectedAttr]: (attrs[selectedAttr] || []).filter((x) => x !== v),
    };
    save(next);
  }

  function resetToDefaults() {
    const d = defaults[categorySlug];
    if (!d) {
      setError("No default set for this category");
      return;
    }
    save({ ...d });
  }

  const currentValues = selectedAttr ? attrs[selectedAttr] || [] : [];
  const catName =
    categories.find((c) => c.slug === categorySlug)?.name || categorySlug;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Category attributes</h1>
          <p className="text-sm text-slate-500">
            Like CodeCanyon: each category has its own attributes (WordPress versions,
            PHP version, Files Included, Widget Ready, etc.). Edit them here — product
            forms load the set for the selected category.
          </p>
        </div>
        <Link href="/admin/categories" className="text-sm text-emerald-600 hover:underline">
          Manage categories
        </Link>
      </div>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          className="w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
          {categories.length === 0 && (
            <option value="wordpress">WordPress</option>
          )}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Editing attribute definitions for <strong>{catName}</strong>
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">
            Attribute names
          </h2>
          <ul className="space-y-1">
            {Object.keys(attrs).map((k) => (
              <li key={k} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedAttr(k)}
                  className={
                    selectedAttr === k
                      ? "flex-1 rounded-md bg-emerald-600 px-2 py-1.5 text-left text-sm font-medium text-white"
                      : "flex-1 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  }
                >
                  {k}
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-slate-400 hover:text-red-600"
                  title="Remove attribute"
                  onClick={() => removeAttributeLabel(k)}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="e.g. Widget Ready"
              value={newAttrLabel}
              onChange={(e) => setNewAttrLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAttributeLabel())}
            />
            <Button type="button" size="sm" onClick={addAttributeLabel}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">
            Values{selectedAttr ? ` · ${selectedAttr}` : ""}
          </h2>
          {!selectedAttr ? (
            <p className="text-sm text-slate-500">Select or add an attribute name.</p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-2">
                {currentValues.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800"
                  >
                    {v}
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-600"
                      onClick={() => removeValue(v)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {currentValues.length === 0 && (
                  <p className="text-sm text-slate-500">No values yet — add one below.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. WordPress 6.9.x"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addValue())}
                />
                <Button type="button" onClick={addValue}>
                  <Plus className="h-4 w-4" /> Add value
                </Button>
              </div>
            </>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={resetToDefaults} disabled={saving}>
          <RotateCcw className="h-4 w-4" /> Reset to CodeCanyon-style defaults
        </Button>
      </div>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      {msg && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}
    </div>
  );
}
