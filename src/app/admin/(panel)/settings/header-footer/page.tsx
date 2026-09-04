"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";
import Link from "next/link";

type FooterLink = { label: string; href: string };
type FooterCol = { title: string; links: FooterLink[] };

const DEFAULT_COLUMNS: FooterCol[] = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse products", href: "/search" },
      { label: "License Types", href: "/pricing/licenses" },
      { label: "Terms of Use", href: "/page/terms" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help Center", href: "/page/help" },
      { label: "Contact Support", href: "/page/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/page/about" },
      { label: "Privacy Policy", href: "/page/privacy" },
    ],
  },
];

export default function HeaderFooterSettingsPage() {
  const [about, setAbout] = useState("");
  const [copyright, setCopyright] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [columns, setColumns] = useState<FooterCol[]>(DEFAULT_COLUMNS);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || d || {};
        setAbout(String(s["footer.aboutText"] ?? ""));
        setCopyright(String(s["footer.copyright"] ?? ""));
        setAnnouncement(String(s["header.announcement"] ?? ""));
        setAnnouncementEnabled(Boolean(s["header.announcementEnabled"]));
        const social = (s["footer.social"] as Record<string, string>) || {};
        setTwitter(social.twitter || String(s["footer.social.twitter"] || ""));
        setGithub(social.github || String(s["footer.social.github"] || ""));
        setLinkedin(social.linkedin || String(s["footer.social.linkedin"] || ""));
        if (Array.isArray(s["footer.columns"]) && s["footer.columns"].length) {
          setColumns(s["footer.columns"] as FooterCol[]);
        }
      })
      .finally(() => setBooting(false));
  }, []);

  async function save() {
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            "header.announcementEnabled": announcementEnabled,
            "header.announcement": announcement,
            "footer.aboutText": about,
            "footer.copyright": copyright,
            "footer.social": { twitter, github, linkedin },
            "footer.columns": columns,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setMsg("Saved. Footer updates on the next page load.");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function updateCol(i: number, patch: Partial<FooterCol>) {
    setColumns((cols) => cols.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  function updateLink(ci: number, li: number, patch: Partial<FooterLink>) {
    setColumns((cols) =>
      cols.map((c, j) =>
        j !== ci
          ? c
          : {
              ...c,
              links: c.links.map((l, k) => (k === li ? { ...l, ...patch } : l)),
            }
      )
    );
  }

  if (booting) return <div className="p-8 text-sm text-slate-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Header & Footer</h1>
        <p className="text-sm text-slate-500">
          Announcement bar, footer text, social links, and editable footer menus.
          Create pages under{" "}
          <Link href="/admin/pages" className="text-emerald-600 hover:underline">
            Pages
          </Link>{" "}
          then link them here (e.g. <code className="text-xs">/page/terms</code>).
        </p>
      </div>

      <section className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Header</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={announcementEnabled}
            onChange={(e) => setAnnouncementEnabled(e.target.checked)}
            className="accent-emerald-600"
          />
          Show announcement bar
        </label>
        <Input
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Announcement text"
        />
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Footer brand</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">About text</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Copyright</label>
          <Input value={copyright} onChange={(e) => setCopyright(e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Twitter / X</label>
            <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} type="url" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">GitHub</label>
            <Input value={github} onChange={(e) => setGithub(e.target.value)} type="url" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">LinkedIn</label>
            <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} type="url" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Footer menus</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setColumns((c) => [...c, { title: "New column", links: [{ label: "Link", href: "/" }] }])
            }
          >
            <Plus className="h-4 w-4" /> Add column
          </Button>
        </div>

        {columns.map((col, ci) => (
          <div key={ci} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-slate-300" />
              <Input
                value={col.title}
                onChange={(e) => updateCol(ci, { title: e.target.value })}
                className="max-w-xs font-semibold"
              />
              <button
                type="button"
                className="ml-auto text-slate-400 hover:text-red-600"
                onClick={() => setColumns((cols) => cols.filter((_, j) => j !== ci))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {col.links.map((link, li) => (
                <li key={li} className="flex flex-wrap gap-2">
                  <Input
                    className="min-w-[8rem] flex-1"
                    value={link.label}
                    onChange={(e) => updateLink(ci, li, { label: e.target.value })}
                    placeholder="Label"
                  />
                  <Input
                    className="min-w-[10rem] flex-[2] font-mono text-xs"
                    value={link.href}
                    onChange={(e) => updateLink(ci, li, { href: e.target.value })}
                    placeholder="/page/about"
                  />
                  <button
                    type="button"
                    className="rounded border p-2 text-slate-400 hover:text-red-600"
                    onClick={() =>
                      updateCol(ci, {
                        links: col.links.filter((_, k) => k !== li),
                      })
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                updateCol(ci, {
                  links: [...col.links, { label: "New link", href: "/" }],
                })
              }
            >
              <Plus className="h-4 w-4" /> Add link
            </Button>
          </div>
        ))}
      </section>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      {msg && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}
      <Button type="button" onClick={save} disabled={loading}>
        {loading ? "Saving…" : "Save header & footer"}
      </Button>
    </div>
  );
}
