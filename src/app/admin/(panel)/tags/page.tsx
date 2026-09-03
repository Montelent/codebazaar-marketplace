"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/taxonomy")
      .then((r) => r.json())
      .then((d) => setTags(d.tags || []))
      .catch(() => {});
  }, []);

  async function save(next: string[]) {
    setError("");
    setMsg("");
    const res = await fetch("/api/admin/taxonomy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setTags(next);
    setMsg("Tags saved to database");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tags</h1>
        <p className="text-sm text-slate-500">
          Selectable tags when editing products. Saved in Supabase.
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="new-tag"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button
          type="button"
          onClick={() => {
            const t = value.trim().toLowerCase();
            if (!t || tags.includes(t)) return;
            save([...tags, t]);
            setValue("");
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm"
          >
            {t}
            <button
              type="button"
              onClick={() => save(tags.filter((x) => x !== t))}
              className="text-slate-400 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
    </div>
  );
}
