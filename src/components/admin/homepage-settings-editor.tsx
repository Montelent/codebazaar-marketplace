"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";

type Cat = { name: string; slug: string; description: string; icon: string };

const DEFAULT_CATS: Cat[] = [
  { name: "WordPress", slug: "wordpress", description: "Themes, plugins & WooCommerce", icon: "🟦" },
  { name: "PHP Scripts", slug: "php-scripts", description: "Laravel, CodeIgniter & scripts", icon: "🐘" },
  { name: "Mobile", slug: "mobile", description: "React Native, Flutter & apps", icon: "📱" },
  { name: "HTML5", slug: "html5", description: "Landing pages & admin templates", icon: "🌐" },
  { name: "JavaScript", slug: "javascript", description: "React, Vue, Node & kits", icon: "⚡" },
  { name: "Plugins", slug: "plugins", description: "Browser, IDE & design plugins", icon: "🔌" },
];

export function HomepageSettingsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [showCategories, setShowCategories] = useState(true);
  const [showFeatured, setShowFeatured] = useState(true);
  const [showBestsellers, setShowBestsellers] = useState(true);
  const [showTrustBlocks, setShowTrustBlocks] = useState(true);
  const [showBlog, setShowBlog] = useState(true);
  const [blogTitle, setBlogTitle] = useState("From the blog");
  const [blogLimit, setBlogLimit] = useState(3);
  const [categories, setCategories] = useState<Cat[]>(DEFAULT_CATS);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings || {};
        if (typeof s["homepage.showCategories"] === "boolean") setShowCategories(s["homepage.showCategories"]);
        if (typeof s["homepage.showFeatured"] === "boolean") setShowFeatured(s["homepage.showFeatured"]);
        if (typeof s["homepage.showBestsellers"] === "boolean") setShowBestsellers(s["homepage.showBestsellers"]);
        if (typeof s["homepage.showTrustBlocks"] === "boolean") setShowTrustBlocks(s["homepage.showTrustBlocks"]);
        if (typeof s["homepage.showBlog"] === "boolean") setShowBlog(s["homepage.showBlog"]);
        if (s["homepage.blogTitle"]) setBlogTitle(String(s["homepage.blogTitle"]));
        if (s["homepage.blogLimit"] != null) setBlogLimit(Number(s["homepage.blogLimit"]) || 3);
        if (Array.isArray(s["homepage.categories"]) && s["homepage.categories"].length) {
          setCategories(
            (s["homepage.categories"] as Cat[]).map((c) => ({
              name: String(c.name || ""),
              slug: String(c.slug || ""),
              description: String(c.description || ""),
              icon: String(c.icon || "📦"),
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateCat(i: number, key: keyof Cat, value: string) {
    setCategories((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  }

  function slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const cleaned = categories
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          slug: (c.slug || slugify(c.name)).trim(),
          description: c.description.trim(),
          icon: c.icon.trim() || "📦",
        }));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            "homepage.showCategories": showCategories,
            "homepage.showFeatured": showFeatured,
            "homepage.showBestsellers": showBestsellers,
            "homepage.showTrustBlocks": showTrustBlocks,
            "homepage.showBlog": showBlog,
            "homepage.blogTitle": blogTitle,
            "homepage.blogLimit": blogLimit,
            "homepage.categories": cleaned,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || data.message || "Save failed");
        return;
      }
      setCategories(cleaned);
      setMsg("Saved. Homepage categories and blog section updated.");
    } catch {
      setMsg("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading homepage settings…</div>;
  }

  return (
    <form onSubmit={onSave} className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage</h1>
          <p className="text-sm text-slate-500">
            Control section visibility, Browse by category cards, and the blog grid.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save homepage"}
        </Button>
      </div>

      {msg && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error")
              ? "bg-amber-50 text-amber-900"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {msg}
        </p>
      )}

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Sections</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Browse by category", value: showCategories, set: setShowCategories },
            { label: "Featured items", value: showFeatured, set: setShowFeatured },
            { label: "Bestsellers", value: showBestsellers, set: setShowBestsellers },
            { label: "Trust blocks", value: showTrustBlocks, set: setShowTrustBlocks },
            { label: "Blog grid", value: showBlog, set: setShowBlog },
          ].map((t) => (
            <label key={t.label} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={t.value}
                onChange={(e) => t.set(e.target.checked)}
                className="accent-emerald-600"
              />
              Show {t.label}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Browse by category</h2>
            <p className="text-xs text-slate-500">
              Add or remove cards shown on the homepage.Slug is used in the URL (/category/slug).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCategories((c) => [...c, { name: "", slug: "", description: "", icon: "📦" }])
            }
          >
            <Plus className="h-4 w-4" /> Add category
          </Button>
        </div>

        <div className="space-y-3">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:items-end"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="hidden h-4 w-4 text-slate-300 sm:block" />
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Icon</label>
                  <Input
                    className="w-16 text-center text-lg"
                    value={cat.icon}
                    onChange={(e) => updateCat(i, "icon", e.target.value)}
                    maxLength={4}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
                <Input
                  value={cat.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategories((prev) =>
                      prev.map((c, idx) => {
                        if (idx !== i) return c;
                        const next = { ...c, name };
                        if (!c.slug || c.slug === slugify(c.name)) next.slug = slugify(name);
                        return next;
                      })
                    );
                  }}
                  placeholder="WordPress"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Slug</label>
                <Input
                  value={cat.slug}
                  onChange={(e) => updateCat(i, "slug", e.target.value)}
                  placeholder="wordpress"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
                <Input
                  value={cat.description}
                  onChange={(e) => updateCat(i, "description", e.target.value)}
                  placeholder="Themes & plugins"
                />
              </div>
              <button
                type="button"
                className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                onClick={() => setCategories((c) => c.filter((_, idx) => idx !== i))}
                aria-label="Remove category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-slate-500">No categories. Click “Add category”.</p>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Blog section</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Section title</label>
            <Input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Posts to show</label>
            <Input
              type="number"
              min={1}
              max={12}
              value={blogLimit}
              onChange={(e) => setBlogLimit(Math.max(1, Math.min(12, Number(e.target.value) || 3)))}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Shows published posts from Admin → Blog. Create and publish posts there to fill the grid.
        </p>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save homepage"}
        </Button>
      </div>
    </form>
  );
}
