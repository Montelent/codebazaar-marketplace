import type { Metadata } from "next";
import Link from "next/link";
import { getAllSettings } from "@/lib/settings";
import { stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAllSettings();
  return { title: stripHtml(String(s["licenses.pageTitle"] ?? "Licensing")) };
}

export default async function LicensingPage() {
  const s = await getAllSettings();
  const pageTitle = stripHtml(String(s["licenses.pageTitle"] ?? "License terms"));
  const introHtml = String(s["licenses.intro"] ?? "");
  const regTitle = stripHtml(String(s["licenses.regular.title"] ?? "Regular License"));
  const regBodyHtml = String(s["licenses.regular.body"] ?? "");
  const extTitle = stripHtml(String(s["licenses.extended.title"] ?? "Extended License"));
  const extBodyHtml = String(s["licenses.extended.body"] ?? "");
  const footerNoteHtml = String(s["licenses.footerNote"] ?? "");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">{pageTitle}</h1>
      {introHtml ? (
        <div
          className="prose prose-slate mt-4 max-w-none text-slate-600"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      ) : null}
      <h2 className="mt-8 text-xl font-semibold text-slate-900">{regTitle}</h2>
      <div
        className="prose prose-slate mt-2 max-w-none text-slate-600"
        dangerouslySetInnerHTML={{ __html: regBodyHtml }}
      />
      <h2 className="mt-6 text-xl font-semibold text-slate-900">{extTitle}</h2>
      <div
        className="prose prose-slate mt-2 max-w-none text-slate-600"
        dangerouslySetInnerHTML={{ __html: extBodyHtml }}
      />
      {footerNoteHtml ? (
        <div
          className="prose prose-sm mt-8 max-w-none text-slate-500"
          dangerouslySetInnerHTML={{ __html: footerNoteHtml }}
        />
      ) : null}
      <p className="mt-10">
        <Link href="/pricing/licenses" className="text-emerald-600 hover:underline">
          View comparison table →
        </Link>
      </p>
      <p className="mt-3">
        <Link href="/" className="text-emerald-600 hover:underline">
          ← Back to marketplace
        </Link>
      </p>
    </div>
  );
}
