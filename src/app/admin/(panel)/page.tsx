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
  Users,
  Star,
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
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/settings/homepage", label: "Homepage", icon: Settings },
  { href: "/admin/settings/payments", label: "Payments", icon: CreditCard },
];

export default async function AdminDashboardPage() {
  let totalItems = 0;
  let freeItems = 0;
  let paidItems = 0;
  let avgPrice = 0;
  let catalogValue = 0;
  let orderCount = 0;
  let revenue = 0;
  let userCount = 0;
  let categoryCount = 0;
  let blogCount = 0;
  let pageCount = 0;
  let dbItemCount = 0;

  try {
    const cards = await listProductCards();
    totalItems = cards.length;
    freeItems = cards.filter((c) => Number(c.regularPrice) <= 0).length;
    paidItems = totalItems - freeItems;
    const paid = cards.filter((c) => Number(c.regularPrice) > 0);
    avgPrice =
      paid.length > 0
        ? paid.reduce((s, c) => s + Number(c.regularPrice), 0) / paid.length
        : 0;
    catalogValue = cards.reduce((s, c) => s + Number(c.regularPrice || 0), 0);
  } catch {
    /* empty */
  }

  try {
    const r = await queryOne<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "Item"`);
    dbItemCount = Number(r?.n || 0);
  } catch {
    /* */
  }

  try {
    const o = await queryOne<{ n: string; rev: string }>(`
      SELECT COUNT(*)::text AS n,
             COALESCE(SUM("total"), 0)::text AS rev
      FROM "Order"
    `);
    orderCount = Number(o?.n || 0);
    revenue = Number(o?.rev || 0);
  } catch {
    /* */
  }

  try {
    const u = await queryOne<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "User"`);
    userCount = Number(u?.n || 0);
  } catch {
    /* */
  }

  try {
    const c = await queryOne<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "Category"`);
    categoryCount = Number(c?.n || 0);
  } catch {
    /* */
  }

  try {
    const b = await queryOne<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "BlogPost"`);
    blogCount = Number(b?.n || 0);
  } catch {
    /* */
  }

  try {
    const p = await queryOne<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "CmsPage"`);
    pageCount = Number(p?.n || 0);
  } catch {
    /* */
  }

  const stats = [
    { label: "Products", value: String(totalItems), icon: Package, href: "/admin/products" },
    { label: "Free", value: String(freeItems), icon: Star, href: "/admin/products" },
    { label: "Paid", value: String(paidItems), icon: DollarSign, href: "/admin/products" },
    { label: "Avg price", value: formatPrice(avgPrice), icon: DollarSign, href: "/admin/products" },
    { label: "Catalog value", value: formatPrice(catalogValue), icon: DollarSign, href: "/admin/products" },
    { label: "Orders", value: formatCompact(orderCount), icon: ShoppingBag, href: "/admin/orders" },
    { label: "Revenue", value: formatPrice(revenue), icon: CreditCard, href: "/admin/orders" },
    { label: "Users", value: String(userCount), icon: Users, href: "/admin/users" },
    { label: "Categories", value: String(categoryCount), icon: FolderTree, href: "/admin/categories" },
    { label: "Blog posts", value: String(blogCount), icon: Newspaper, href: "/admin/blog" },
    { label: "Pages", value: String(pageCount), icon: FileText, href: "/admin/pages" },
    { label: "DB records", value: String(dbItemCount), icon: Package, href: "/admin/products" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Live overview of catalog, sales, users, and content.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <c.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{c.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{c.value}</p>
          </Link>
        ))}
      </div>
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
