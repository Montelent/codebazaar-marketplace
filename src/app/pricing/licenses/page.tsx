import type { Metadata } from "next";
import Link from "next/link";
import { getAllSettings } from "@/lib/settings";
import { stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CompRow = { feature: string; regular: string; extended: string };

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAllSettings();
  const title = stripHtml(String(s["licenses.pageTitle"] ?? "License Types"));
  return {
    title,
    description: stripHtml(String(s["licenses.intro"] ?? "Regular vs Extended licenses.")),
  };
}

export default async function LicensesPage() {
  const s = await getAllSettings();
  const pageTitle = stripHtml(String(s["licenses.pageTitle"] ?? "License Types"));
  const regTitle = stripHtml(String(s["licenses.regular.title"] ?? "Regular License"));
  const regBodyHtml = String(
    s["licenses.regular.body"] ??
      "<p>Use the item to create one end product for yourself or one client.</p>"
  );
  const extTitle = stripHtml(String(s["licenses.extended.title"] ?? "Extended License"));
  const extBodyHtml = String(
    s["licenses.extended.body"] ??
      "<p>Use the item in one end product that may be sold to end users (e.g. SaaS).</p>"
  );
  const introHtml = String(
    s["licenses.intro"] ??
      "<p>Every product on CodeBazaar is sold under two license tiers — Regular and Extended.</p>"
  );
  const footerNoteHtml = String(s["licenses.footerNote"] ?? "");
  const rows = (
    Array.isArray(s["licenses.comparison"])
      ? (s["licenses.comparison"] as CompRow[])
      : [
          { feature: "Number of end products", regular: "1", extended: "1" },
          {
            feature: "Paid / commercial use",
            regular: "Yes (single product)",
            extended: "Yes (including SaaS)",
          },
          { feature: "Charge end users", regular: "No", extended: "Yes" },
          { feature: "Resell item as stock", regular: "No", extended: "No" },
        ]
  ).filter((r) => r && r.feature);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">{pageTitle}</h1>
      <div
        className="prose prose-slate mt-3 max-w-none text-slate-600"
        dangerouslySetInnerHTML={{ __html: introHtml }}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-emerald-700">{regTitle}</h2>
          <div
            className="prose prose-sm mt-3 max-w-none text-slate-600"
            dangerouslySetInnerHTML={{ __html: regBodyHtml }}
          />
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-emerald-800">{extTitle}</h2>
          <div
            className="prose prose-sm mt-3 max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: extBodyHtml }}
          />
        </div>
      </div>

      <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold">Feature</th>
              <th className="px-4 py-3 text-left font-semibold text-emerald-700">{regTitle}</th>
              <th className="px-4 py-3 text-left font-semibold text-emerald-700">{extTitle}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr key={row.feature}>
                <td className="px-4 py-3 font-medium text-slate-800">{row.feature}</td>
                <td className="px-4 py-3 text-slate-600">{row.regular}</td>
                <td className="px-4 py-3 text-slate-600">{row.extended}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footerNoteHtml ? (
        <div
          className="prose prose-sm mt-6 max-w-none text-slate-500"
          dangerouslySetInnerHTML={{ __html: footerNoteHtml }}
        />
      ) : null}

      <p className="mt-10 text-center">
        <Link href="/" className="text-emerald-600 hover:underline">
          ← Back to store
        </Link>
      </p>
    </div>
  );
}
