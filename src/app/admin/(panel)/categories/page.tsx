import { CATEGORY_CARDS } from "@/lib/mock-data";

export const metadata = { title: "Categories · Admin" };

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500">Marketplace taxonomy</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_CARDS.map((c) => (
          <div key={c.slug} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-2xl">{c.icon}</div>
            <h3 className="mt-2 font-semibold">{c.name}</h3>
            <p className="text-xs text-slate-500">{c.description}</p>
            <p className="mt-2 font-mono text-xs text-slate-400">{c.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
