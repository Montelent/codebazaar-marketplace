import Link from "next/link";

export const metadata = { title: "Purchases · Account" };

export default function PurchasesPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Purchases</h2>
      <p className="mt-1 text-sm text-slate-500">
        Items you have licensed. After checkout, licenses and invoices appear here.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
        <p className="text-sm text-slate-600">No purchases yet.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline">
          Browse marketplace
        </Link>
      </div>
    </div>
  );
}
