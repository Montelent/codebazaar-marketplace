import Link from "next/link";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { formatPrice, formatCompact } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = { title: "Products · Admin" };

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage marketplace items · Regular & Extended licensing</p>
        </div>
        <Link href="/admin/products/new">
          <Button><Plus className="h-4 w-4" /> Add product</Button>
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Regular</th>
              <th className="px-4 py-3">Extended</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_ITEMS.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="max-w-xs px-4 py-3">
                  <Link href={`/item/${item.slug}/${item.id}`} className="line-clamp-1 font-medium hover:text-emerald-700">{item.title}</Link>
                  <div className="text-xs text-slate-400">{item.slug}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.category.name}</td>
                <td className="px-4 py-3">{formatPrice(Number(item.regularPrice))}</td>
                <td className="px-4 py-3">{formatPrice(Number(item.extendedPrice))}</td>
                <td className="px-4 py-3">{formatCompact(item.salesCount)}</td>
                <td className="px-4 py-3">{item.ratingAvg.toFixed(1)}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Live</span></td>
                <td className="px-4 py-3"><Link href={`/item/${item.slug}/${item.id}`} className="text-xs font-medium text-emerald-600 hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
