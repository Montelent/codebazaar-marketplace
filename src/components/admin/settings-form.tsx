"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CKEditorField } from "@/components/editor/ck-editor";

type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "checkbox"
  | "url"
  | "color"
  | "gradient";

type Props = {
  title: string;
  description?: string;
  initial: Record<string, unknown>;
  fields: {
    key: string;
    label: string;
    type?: FieldType;
    help?: string;
  }[];
};

function normalizeHex(v: string): string {
  let s = v.trim();
  if (!s) return "#000000";
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  return s.toLowerCase();
}

function plainText(val: unknown): string {
  return String(val ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function ColorField({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const hex = normalizeHex(value || "#000000");
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000";
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-slate-200 bg-white p-1"
          title="Pick color"
        />
        <Input
          className="max-w-[10rem] font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#059669"
        />
        <span
          className="h-10 w-10 rounded-md border border-slate-200"
          style={{ backgroundColor: pickerValue }}
          title={pickerValue}
        />
      </div>
      {help && <p className="mt-1 text-xs text-slate-500">{help}</p>}
    </div>
  );
}

function GradientField({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  let from = "#0f172a";
  let to = "#059669";
  let angle = "135";
  const raw = String(value || "");
  if (raw.includes("|") && !raw.includes("gradient")) {
    const [a, b, c] = raw.split("|");
    from = a || from;
    to = b || to;
    angle = c || angle;
  } else if (raw.includes("gradient")) {
    const m = raw.match(/#[0-9a-fA-F]{3,8}/g);
    if (m?.[0]) from = m[0];
    if (m?.[1]) to = m[1];
  }

  const css = `linear-gradient(${angle}deg, ${normalizeHex(from)}, ${normalizeHex(to)})`;

  function emit(f: string, t: string, ang: string) {
    onChange(`${normalizeHex(f)}|${normalizeHex(t)}|${ang}`);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div
        className="h-16 w-full rounded-lg border border-slate-200"
        style={{ background: css }}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <ColorField label="From" value={from} onChange={(v) => emit(v, to, angle)} />
        <ColorField label="To" value={to} onChange={(v) => emit(from, v, angle)} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Angle (°)</label>
          <Input
            type="number"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => emit(from, to, e.target.value)}
          />
        </div>
      </div>
      <Input className="font-mono text-xs" value={css} readOnly title="Generated CSS" />
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}

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
        setMsg(data.error || data.message || "Save failed. Check database connection.");
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
                <input
                  type="checkbox"
                  checked={Boolean(val)}
                  onChange={(e) => set(f.key, e.target.checked)}
                  className="accent-emerald-600"
                />
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
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={plainText(val)}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.label}
                />
                {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
              </div>
            );
          }
          if (f.type === "richtext") {
            return (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
                <CKEditorField
                  value={String(val ?? "")}
                  onChange={(html) => set(f.key, html)}
                  minHeight={160}
                  placeholder={f.label}
                />
                {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
              </div>
            );
          }
          if (f.type === "color") {
            return (
              <ColorField
                key={f.key}
                label={f.label}
                help={f.help}
                value={String(val ?? "#000000")}
                onChange={(v) => set(f.key, v)}
              />
            );
          }
          if (f.type === "gradient") {
            return (
              <GradientField
                key={f.key}
                label={f.label}
                help={f.help}
                value={String(val ?? "#0f172a|#059669|135")}
                onChange={(v) => set(f.key, v)}
              />
            );
          }
          return (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
              <Input
                type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                value={plainText(val)}
                onChange={(e) =>
                  set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                }
              />
              {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
            </div>
          );
        })}
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
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
