"use client";

import Link from "next/link";

const LINKABLE = new Set([
  "Compatible Browsers",
  "Software Framework",
  "Software Version",
  "Files Included",
  "High Resolution",
  "Tags",
  "Compatible With",
  "ThemeForest Files Included",
  "Columns",
  "Layout",
]);

function searchHref(label: string, token: string) {
  const q = encodeURIComponent(token.trim());
  return `/search?q=${q}&attr=${encodeURIComponent(label)}`;
}

type Props = {
  label: string;
  value: string;
  tagsFallback?: string[];
};

export function AttributeRow({ label, value, tagsFallback }: Props) {
  const raw =
    label === "Tags" && (!value || !value.trim()) && tagsFallback?.length
      ? tagsFallback.join(", ")
      : value;

  const isDate =
    label === "Last Update" ||
    label === "Published" ||
    label === "Created" ||
    label === "Updated";

  if (isDate) {
    return (
      <div className="grid grid-cols-[130px_1fr] gap-2 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
        <dt className="text-slate-500">{label}</dt>
        <dd className="font-medium text-slate-800">{raw || "—"}</dd>
      </div>
    );
  }

  if (LINKABLE.has(label) || label === "Tags") {
    const tokens = raw
      .split(/[,|/]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    return (
      <div className="grid grid-cols-[130px_1fr] gap-2 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
        <dt className="text-slate-500">{label}</dt>
        <dd className="font-medium text-slate-800">
          <div className="flex flex-wrap gap-1.5">
            {tokens.length === 0 ? (
              <span>—</span>
            ) : (
              tokens.map((t) => (
                <Link
                  key={t}
                  href={searchHref(label, t)}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:underline"
                >
                  {t}
                </Link>
              ))
            )}
          </div>
        </dd>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[130px_1fr] gap-2 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{raw || "—"}</dd>
    </div>
  );
}
