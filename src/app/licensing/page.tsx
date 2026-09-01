import Link from "next/link";

export const metadata = { title: "Licensing · CodeBazaar" };

export default function LicensingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">License terms</h1>
      <p className="mt-4 text-slate-600">
        CodeBazaar uses Regular and Extended licenses similar to Envato / CodeCanyon.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-slate-900">Regular License</h2>
      <p className="mt-2 text-slate-600">
        Use the item to create one end product (website, app, or template) for yourself or one client.
        The end product can be distributed for free, but not sold.
      </p>
      <h2 className="mt-6 text-xl font-semibold text-slate-900">Extended License</h2>
      <p className="mt-2 text-slate-600">
        Use the item in one end product that may be sold to end users (e.g. a paid SaaS or theme).
        Still limited to a single end product per license.
      </p>
      <p className="mt-10">
        <Link href="/" className="text-emerald-600 hover:underline">
          ← Back to marketplace
        </Link>
      </p>
    </div>
  );
}
