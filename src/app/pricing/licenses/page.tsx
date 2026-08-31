import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "License Types",
  description: "Regular vs Extended licenses on CodeBazaar.",
};

export default function LicensesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">License Types</h1>
      <p className="mt-3 text-slate-600">
        Every product is sold by CodeBazaar under two license tiers.
      </p>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold">Feature</th>
              <th className="px-4 py-3 text-left font-semibold text-emerald-700">Regular</th>
              <th className="px-4 py-3 text-left font-semibold text-emerald-700">Extended</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 font-medium">End products</td>
              <td className="px-4 py-3">1</td>
              <td className="px-4 py-3">Unlimited</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Paid / commercial use</td>
              <td className="px-4 py-3">Yes (single product)</td>
              <td className="px-4 py-3">Yes (multiple / SaaS)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Resell the product itself</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">Yes (as part of your offering)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-8 text-center">
        <Link href="/" className="text-emerald-600 hover:underline">← Back to store</Link>
      </p>
    </div>
  );
}
