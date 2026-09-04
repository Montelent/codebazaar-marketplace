"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Page = { id: string; title: string; slug: string; status: string };

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((d) => setPages(d.pages || []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
          <p className="text-sm text-slate-500">Terms, Privacy, About, Help…</p>
        </div>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="h-4 w-4" /> Add page
          </Button>
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {pages.length === 0 ? (
          <p className="text-sm text-slate-500">No CMS pages yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pages.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-400">/{p.slug}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                    {p.status}
                  </span>
                  <Link
                    href={`/admin/pages/${p.id}/edit`}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
