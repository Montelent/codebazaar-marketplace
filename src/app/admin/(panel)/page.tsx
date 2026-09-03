import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Newspaper,
  FileText,
  Settings,
  CreditCard,
  FolderTree,
  Tags,
} from "lucide-react";
import { formatCompact, formatPrice } from "@/lib/utils";
import { queryOne } from "@/lib/db";
import { listProductCards } from "@/lib/product-store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Admin" };

const QUICK = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Add product", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/settings/homepage", label: "Homepage", icon: Settings },
  { href: "/admin/settings/payments", label: "Payments", icon: CreditCard },
];

export default async function AdminDashboardPage() {
  let totalItems = 0;
  let freeItems = 0;
  let avgPrice = 0;
  let orderCount = 0;
  let publishedInDb = 0;

  try {
    const cards = await listProductCards();
    totalItems = cards.length;
    freeItems = cards.filter((c) => Number(c.regularPrice) <= 0).length;
    const paid = cards.filter((c) => Number(c.regularPrice) > 0);
    avgPrice =
      paid.length > 0
        ? paid.reduce((s, c) => s + Number(c.regularPrice), 0) / paid.length
        : 0;
  } catch {
    /* empty */
  }

  try {
    const stats = await queryOne<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "Item"`);
    publishedInDb = Number(stats?.n || 0);
  } catch {
    /* empty */
  }

  try {
    const o = await queryOne<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "Order"`);
    orderCount = Number(o?.n || 0);
  } catch {
    /* empty */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage products, categories, content, and storefront settings.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Products", value: String(totalItems), icon: Package },
          { label: "Free items", value: String(freeItems), icon: Package },
          { label: "Avg price", value: formatPrice(avgPrice), icon: DollarSign },
          { label: "Orders", value: formatCompact(orderCount), icon: ShoppingBag },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <c.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{c.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>
      {publishedInDb > 0 && (
        <p className="text-xs text-slate-500">
          {publishedInDb} product record{publishedInDb === 1 ? "" : "s"} saved in the database
          (edits &amp; new items).
        </p>
      )}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick links
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK.map((q) => (
            <Link
              key={q.href + q.label}
              href={q.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <q.icon className="h-5 w-5 text-emerald-600" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
