"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CKEditorField } from "@/components/editor/ck-editor";

type Props = {
  title: string;
  description?: string;
  initial: Record<string, unknown>;
  fields: {
    key: string;
    label: string;
    type?: "text" | "textarea" | "number" | "checkbox" | "url";
    help?: string;
  }[];
};

export function SettingsForm({ title, description, initial, fields }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (key: string, v: unknown) => setValues((prev) => ({ ...prev, [key]: v }));

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.hint || data.error || "Save failed — run prisma db push if tables are missing");
        return;
      }
      setMsg("Saved successfully");
    } catch {
      setMsg("Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {fields.map((f) => {
          const val = values[f.key];
          if (f.type === "checkbox") {
            return (
              <label key={f.key} className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={Boolean(val)} onChange={(e) => set(f.key, e.target.checked)} className="accent-emerald-600" />
                <span>
                  <span className="font-medium text-slate-800">{f.label}</span>
                  {f.help && <span className="block text-xs text-slate-500">{f.help}</span>}
                </span>
              </label>
            );
          }
          if (f.type === "textarea") {
            return (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
                <CKEditorField value={String(val ?? "")} onChange={(html) => set(f.key, html)} minHeight={160} placeholder={f.label} />
                {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
              </div>
            );
          }
          return (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
              <Input
                type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                value={String(val ?? "")}
                onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
              />
              {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
            </div>
          );
        })}
        {msg && (
          <p className={`rounded px-3 py-2 text-sm ${
            msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error")
              ? "bg-amber-50 text-amber-900"
              : "bg-emerald-50 text-emerald-800"
          }`}>{msg}</p>
        )}
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </form>
  );
}
