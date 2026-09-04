"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { CKEditorField } from "@/components/editor/ck-editor";

type Row = { feature: string; regular: string; extended: string };

const DEFAULT_ROWS: Row[] = [
  { feature: "Number of end products", regular: "1", extended: "1" },
  { feature: "Use in a free end product", regular: "Yes", extended: "Yes" },
  {
    feature: "Use in a paid / commercial end product",
    regular: "Yes (single product)",
    extended: "Yes (including SaaS)",
  },
  { feature: "Charge end users for the product", regular: "No", extended: "Yes" },
  { feature: "Resell the item itself as stock", regular: "No", extended: "No" },
  { feature: "Support included", regular: "6 months", extended: "6 months" },
];

export function LicensesSettingsEditor() {
  const [pageTitle, setPageTitle] = useState("License Types");
  const [intro, setIntro] = useState("");
  const [regTitle, setRegTitle] = useState("Regular License");
  const [regBlurb, setRegBlurb] = useState("");
  const [regBody, setRegBody] = useState("");
  const [extTitle, setExtTitle] = useState("Extended License");
  const [extBlurb, setExtBlurb] = useState("");
  const [extBody, setExtBody] = useState("");
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [footerNote, setFooterNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings || {};
        if (s["licenses.pageTitle"]) setPageTitle(String(s["licenses.pageTitle"]));
        if (s["licenses.intro"]) setIntro(String(s["licenses.intro"]));
        if (s["licenses.regular.title"]) setRegTitle(String(s["licenses.regular.title"]));
        if (s["licenses.regular.blurb"]) setRegBlurb(String(s["licenses.regular.blurb"]));
        if (s["licenses.regular.body"]) setRegBody(String(s["licenses.regular.body"]));
        if (s["licenses.extended.title"]) setExtTitle(String(s["licenses.extended.title"]));
        if (s["licenses.extended.blurb"]) setExtBlurb(String(s["licenses.extended.blurb"]));
        if (s["licenses.extended.body"]) setExtBody(String(s["licenses.extended.body"]));
        if (Array.isArray(s["licenses.comparison"]) && s["licenses.comparison"].length) {
          setRows(s["licenses.comparison"] as Row[]);
        }
        if (s["licenses.footerNote"]) setFooterNote(String(s["licenses.footerNote"]));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateRow(i: number, key: keyof Row, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            "licenses.pageTitle": pageTitle,
            "licenses.intro": intro,
            "licenses.regular.title": regTitle,
            "licenses.regular.blurb": regBlurb,
            "licenses.regular.body": regBody,
            "licenses.extended.title": extTitle,
            "licenses.extended.blurb": extBlurb,
            "licenses.extended.body": extBody,
            "licenses.comparison": rows.filter((r) => r.feature.trim()),
            "licenses.footerNote": footerNote,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || data.message || "Save failed");
        return;
      }
      setMsg("Saved. Storefront license pages will use these details.");
    } catch {
      setMsg("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading license settings…</div>;
  }

  return (
    <form onSubmit={onSave} className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Licenses</h1>
          <p className="text-sm text-slate-500">
            Edit Regular & Extended license copy shown on{" "}
            <Link
              href="/pricing/licenses"
              className="text-emerald-600 hover:underline"
              target="_blank"
            >
              /pricing/licenses
            </Link>{" "}
            and product license pickers.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save licenses"}
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

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Page header</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Page title</label>
          <Input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Intro text (TinyMCE)</label>
          <CKEditorField value={intro} onChange={setIntro} minHeight={120} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">Regular license</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <Input value={regTitle} onChange={(e) => setRegTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Short blurb (product dropdown)
            </label>
            <Input value={regBlurb} onChange={(e) => setRegBlurb(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Full description (TinyMCE)
            </label>
            <CKEditorField value={regBody} onChange={setRegBody} minHeight={180} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">Extended license</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <Input value={extTitle} onChange={(e) => setExtTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Short blurb (product dropdown)
            </label>
            <Input value={extBlurb} onChange={(e) => setExtBlurb(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Full description (TinyMCE)
            </label>
            <CKEditorField value={extBody} onChange={setExtBody} minHeight={180} />
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Comparison table</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRows((r) => [...r, { feature: "", regular: "", extended: "" }])}
          >
            <Plus className="h-4 w-4" /> Add row
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-2 py-2">Feature</th>
                <th className="px-2 py-2">Regular</th>
                <th className="px-2 py-2">Extended</th>
                <th className="w-12 px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-2 py-2">
                    <Input
                      value={row.feature}
                      onChange={(e) => updateRow(i, "feature", e.target.value)}
                      placeholder="Feature name"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      value={row.regular}
                      onChange={(e) => updateRow(i, "regular", e.target.value)}
                      placeholder="Regular value"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      value={row.extended}
                      onChange={(e) => updateRow(i, "extended", e.target.value)}
                      placeholder="Extended value"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Footer note</h2>
        <CKEditorField value={footerNote} onChange={setFooterNote} minHeight={100} />
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save licenses"}
        </Button>
      </div>
    </form>
  );
}
