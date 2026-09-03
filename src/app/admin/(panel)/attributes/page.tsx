"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

type AttrMap = Record<string, string[]>;

export default function AdminAttributesPage() {
  const [attrs, setAttrs] = useState<AttrMap>({});
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState("Compatible Browsers");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/taxonomy")
      .then((r) => r.json())
      .then((d) => {
        const a = d.attributes || {};
        setAttrs(a);
        const keys = Object.keys(a);
        if (keys.length) setSelected(keys[0]);
      })
      .catch(() => {});
  }, []);

  async function save(next: AttrMap) {
    setError("");
    setMsg("");
    const res = await fetch("/api/admin/taxonomy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attributes: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setAttrs(next);
    setMsg("Attributes saved to database");
  }

  const current = attrs[selected] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Product attributes</h1>
        <p className="text-sm text-slate-500">
          Presets for Compatible Browsers, Framework, Files Included, etc.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.keys(attrs).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSelected(k)}
            className={
              selected === k
                ? "rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white"
                : "rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
            }
          >
            {k}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="New attribute label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="max-w-xs"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const l = label.trim();
            if (!l || attrs[l]) return;
            save({ ...attrs, [l]: [] });
            setSelected(l);
            setLabel("");
          }}
        >
          <Plus className="h-4 w-4" /> Add attribute type
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">{selected}</h2>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Add value (e.g. Chrome)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => {
              const v = value.trim();
              if (!v || current.includes(v)) return;
              save({ ...attrs, [selected]: [...current, v] });
              setValue("");
            }}
          >
            <Plus className="h-4 w-4" /> Add value
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {current.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
            >
              {v}
              <button
                type="button"
                onClick={() =>
                  save({
                    ...attrs,
                    [selected]: current.filter((x) => x !== v),
                  })
                }
                className="text-slate-400 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
    </div>
  );
}
