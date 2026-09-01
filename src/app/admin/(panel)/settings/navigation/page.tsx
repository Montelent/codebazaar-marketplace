"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";

type LinkItem = { label: string; href: string };
type Cat = { name: string; slug: string; subs: string[] };

export default function NavigationSettingsPage() {
  const [main, setMain] = useState<LinkItem[]>([]);
  const [utility, setUtility] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings || {};
        setMain((s["nav.main"] as LinkItem[]) || []);
        setUtility((s["nav.utility"] as LinkItem[]) || []);
        setCategories((s["nav.categories"] as Cat[]) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            "nav.main": main,
            "nav.utility": utility,
            "nav.categories": categories,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      setMsg(
        res.ok
          ? "Menus saved — refresh the storefront to see changes"
          : data.hint || data.error || "Save failed"
      );
    } catch {
      setMsg("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading menus…</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/settings" className="text-sm text-emerald-600 hover:underline">
          ← All settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Navigation menus</h1>
        <p className="text-sm text-slate-500">
          Edit top utility links, main links, and category mega-menu (CodeCanyon-style header)
        </p>
      </div>

      <MenuSection title="Utility bar (top)" items={utility} onChange={setUtility} />
      <MenuSection title="Main links (right of categories)" items={main} onChange={setMain} />

      <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Category mega menu</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCategories((c) => [
                ...c,
                { name: "New category", slug: "new-category", subs: [] },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add category
          </Button>
        </div>
        {categories.map((cat, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex gap-2">
              <Input
                value={cat.name}
                onChange={(e) => {
                  const next = [...categories];
                  next[i] = { ...next[i], name: e.target.value };
                  setCategories(next);
                }}
                placeholder="Name"
              />
              <Input
                value={cat.slug}
                onChange={(e) => {
                  const next = [...categories];
                  next[i] = { ...next[i], slug: e.target.value };
                  setCategories(next);
                }}
                placeholder="slug"
              />
              <button
                type="button"
                className="rounded border p-2 text-slate-500"
                onClick={() => setCategories((list) => list.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-1 text-xs text-slate-500">Sub-items (comma-separated)</p>
            <Input
              value={(cat.subs || []).join(", ")}
              onChange={(e) => {
                const next = [...categories];
                next[i] = {
                  ...next[i],
                  subs: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                };
                setCategories(next);
              }}
              placeholder="Laravel, CodeIgniter, Utilities"
            />
          </div>
        ))}
      </section>

      {msg && (
        <p
          className={`rounded px-3 py-2 text-sm ${
            msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error")
              ? "bg-amber-50 text-amber-900"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {msg}
        </p>
      )}
      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save navigation"}
      </Button>
    </div>
  );
}

function MenuSection({
  title,
  items,
  onChange,
}: {
  title: string;
  items: LinkItem[];
  onChange: (v: LinkItem[]) => void;
}) {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase text-slate-500">{title}</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, { label: "New link", href: "/" }])}
        >
          <Plus className="h-4 w-4" /> Add link
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-300" />
          <Input
            value={item.label}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], label: e.target.value };
              onChange(next);
            }}
            placeholder="Label"
          />
          <Input
            value={item.href}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], href: e.target.value };
              onChange(next);
            }}
            placeholder="/path"
          />
          <button
            type="button"
            className="rounded border p-2"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </section>
  );
}
