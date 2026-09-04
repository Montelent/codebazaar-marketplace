"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Upload } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  help?: string;
  accept?: string;
  maxBytes?: number;
};

export function MediaField({
  label,
  value,
  onChange,
  help,
  accept = "image/*",
  maxBytes = 900_000,
}: Props) {
  const [mode, setMode] = useState<"url" | "upload">(
    value?.startsWith("data:") ? "upload" : "url"
  );
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    setErr("");
    if (!file) return;
    if (file.size > maxBytes) {
      setErr(
        `File too large (${Math.round(file.size / 1024)}KB). Max ${Math.round(maxBytes / 1024)}KB for direct upload — use an external URL instead.`
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex rounded-md border border-slate-200 text-xs">
          <button
            type="button"
            className={
              mode === "url"
                ? "flex items-center gap-1 rounded-l-md bg-emerald-600 px-2.5 py-1 font-medium text-white"
                : "flex items-center gap-1 rounded-l-md px-2.5 py-1 text-slate-600 hover:bg-slate-50"
            }
            onClick={() => setMode("url")}
          >
            <Link2 className="h-3.5 w-3.5" /> External URL
          </button>
          <button
            type="button"
            className={
              mode === "upload"
                ? "flex items-center gap-1 rounded-r-md bg-emerald-600 px-2.5 py-1 font-medium text-white"
                : "flex items-center gap-1 rounded-r-md px-2.5 py-1 text-slate-600 hover:bg-slate-50"
            }
            onClick={() => setMode("upload")}
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>
      </div>
      {mode === "url" ? (
        <Input
          type="url"
          placeholder="https://…"
          value={value?.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {value?.startsWith("data:") && (
            <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
              Clear
            </Button>
          )}
        </div>
      )}
      {value && (value.startsWith("http") || value.startsWith("data:image")) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mt-1 h-20 w-auto max-w-full rounded border border-slate-200 object-cover"
        />
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}

type MultiProps = {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  help?: string;
};

export function ScreenshotFields({ label, values, onChange, help }: MultiProps) {
  const [urlDraft, setUrlDraft] = useState("");

  function addUrl() {
    const u = urlDraft.trim();
    if (!u) return;
    onChange([...values, u]);
    setUrlDraft("");
  }

  function onFile(file: File | undefined) {
    if (!file || file.size > 900_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange([...values, reader.result]);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {help && <p className="text-xs text-slate-500">{help}</p>}
      <div className="flex gap-2">
        <Input
          placeholder="https://screenshot-url…"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <Button type="button" variant="outline" onClick={addUrl}>
          Add URL
        </Button>
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach((f) => onFile(f));
        }}
      />
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v} alt="" className="h-16 w-24 rounded border object-cover" />
              <button
                type="button"
                className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] text-white"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
