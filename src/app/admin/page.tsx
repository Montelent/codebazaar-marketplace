import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { formatPrice, formatCompact } from "@/lib/utils";
import { Package, DollarSign, ShoppingBag, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminSignOut } from "@/components/admin/sign-out-button";

export const metadata = {
  title: "Admin",
  description: "CodeBazaar store administration",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const totalSales = MOCK_ITEMS.reduce((s, i) => s + i.salesCount, 0);
  const totalItems = MOCK_ITEMS.length;
  const avgRating =
    MOCK_ITEMS.reduce((s, i) => s + i.ratingAvg, 0) / Math.max(totalItems, 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">
            Signed in as {session.user.email} · Single-vendor store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-medium text-emerald-600 hover:underline">
            View storefront
          </Link>
          <AdminSignOut />
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Backend status:</strong> Auth is live. Catalog uses demo data until you run{" "}
        <code className="rounded bg-amber-100 px-1">prisma db push</code> and seed against Neon.
        Admin API: <code className="rounded bg-amber-100 px-1">GET/POST /api/admin/products</code>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Products</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalItems}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Units sold</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCompact(totalSales)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Catalog value</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatPrice(MOCK_ITEMS.reduce((s, i) => s + Number(i.regularPrice), 0))}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Avg rating</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{avgRating.toFixed(1)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="font-semibold text-slate-900">Products</h2>
          <span className="text-xs text-slate-500">Admin-only catalog</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_ITEMS.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/item/${item.slug}/${item.id}`}
                      className="font-medium text-slate-900 hover:text-emerald-700"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.category.name}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(Number(item.regularPrice))}</td>
                  <td className="px-4 py-3">{formatCompact(item.salesCount)}</td>
                  <td className="px-4 py-3">{item.ratingAvg.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Live
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
