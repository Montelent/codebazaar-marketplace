"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  license: "REGULAR" | "EXTENDED";
  onChange: (v: "REGULAR" | "EXTENDED") => void;
  regularPrice: number;
  extendedPrice: number;
  saleRegular?: number | null;
  saleExtended?: number | null;
};

const OPTIONS = [
  {
    id: "REGULAR" as const,
    label: "Regular License",
    blurb: "For a single end product (free or paid end users).",
  },
  {
    id: "EXTENDED" as const,
    label: "Extended License",
    blurb: "For one end product sold to end users (SaaS, paid app).",
  },
];

export function LicensePicker({
  license,
  onChange,
  regularPrice,
  extendedPrice,
  saleRegular,
  saleExtended,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = OPTIONS.find((o) => o.id === license)!;
  const priceFor = (id: "REGULAR" | "EXTENDED") => {
    if (id === "REGULAR") {
      return saleRegular != null && Number(saleRegular) > 0
        ? Number(saleRegular)
        : Number(regularPrice);
    }
    return saleExtended != null && Number(saleExtended) > 0
      ? Number(saleExtended)
      : Number(extendedPrice);
  };

  return (
    <div ref={rootRef} className="relative z-30 flex-1">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-800 shadow-sm hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span>{current.label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition", open && "rotate-180")} />
      </button>

      {open && (
        <ul role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {OPTIONS.map((opt) => {
            const active = opt.id === license;
            const p = priceFor(opt.id);
            return (
              <li key={opt.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full flex-col gap-0.5 px-3 py-3 text-left transition hover:bg-emerald-50",
                    active && "bg-emerald-50/80"
                  )}
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      {active && <Check className="h-4 w-4 text-emerald-600" />}
                      {opt.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{formatPrice(p)}</span>
                  </span>
                  <span className="pl-6 text-xs text-slate-500">{opt.blurb}</span>
                </button>
              </li>
            );
          })}
          <li className="border-t border-slate-100 bg-slate-50 px-3 py-2">
            <a href="/licensing" className="text-xs font-medium text-emerald-700 hover:underline" onClick={() => setOpen(false)}>
              View license details
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
