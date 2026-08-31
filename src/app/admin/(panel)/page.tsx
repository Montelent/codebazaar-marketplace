import Link from "next/link";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { formatPrice, formatCompact } from "@/lib/utils";
import { Package, DollarSign, ShoppingBag, Users, FileText, Newspaper, CreditCard, Settings } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

const QUICK = [
  { href: "/admin/products", label: "Manage products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/blog", label: "Blog posts", icon: Newspaper },
  { href: "/admin/pages", label: "CMS pages", icon: FileText },
  { href: "/admin/settings/homepage", label: "Homepage", icon: Settings },
  { href: "/admin/settings/payments", label: "Payments", icon: CreditCard },
];

export default function AdminDashboardPage() {
  const totalSales = MOCK_ITEMS.reduce((s, i) => s + i.salesCount, 0);
  const totalItems = MOCK_ITEMS.length;
  const avgRating = MOCK_ITEMS.reduce((s, i) => s + i.ratingAvg, 0) / Math.max(totalItems, 1);
  const catalogValue = MOCK_ITEMS.reduce((s, i) => s + Number(i.regularPrice), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Single-vendor control panel · CodeCanyon-style commerce backend</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Products", value: String(totalItems), icon: Package },
          { label: "Units sold", value: formatCompact(totalSales), icon: ShoppingBag },
          { label: "Catalog value", value: formatPrice(catalogValue), icon: DollarSign },
          { label: "Avg rating", value: avgRating.toFixed(1), icon: Users },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <c.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{c.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700">
              <q.icon className="h-5 w-5 text-emerald-600" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
