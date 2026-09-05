import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getOverrides } from "@/lib/product-store";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products · Admin" };

type Row = {
  id: string;
  slug: string;
  title: string;
  regularPrice: number;
  extendedPrice: number;
  categoryName?: string;
  status?: string;
  isFree?: boolean;
};

export default async function AdminProductsPage() {
  const overrides = await getOverrides().catch(() => ({} as Record<string, never>));
  let rows: Row[] = [];

  try {
    const { rows: dbRows } = await query<{
      id: string;
      slug: string;
      title: string;
      regularPrice: number | string;
      extendedPrice: number | string;
      status: string;
      categoryName: string | null;
    }>(`
      SELECT i.id, i.slug, i.title, i."regularPrice", i."extendedPrice",
             i.status::text AS status, c.name AS "categoryName"
      FROM "Item" i
      LEFT JOIN "Category" c ON c.id = i."categoryId"
      ORDER BY i."createdAt" DESC NULLS LAST
      LIMIT 300
    `);
    rows = dbRows.map((r) => {
      const o = overrides[r.id] || overrides[r.slug];
      let regular = Number(r.regularPrice);
      let extended = Number(r.extendedPrice);
      if (o) {
        if (o.isFree || Number(o.regularPrice) === 0) {
          regular = 0;
          extended = 0;
        } else {
          if (o.regularPrice != null) regular = Number(o.regularPrice);
          if (o.extendedPrice != null) extended = Number(o.extendedPrice);
        }
      }
      const isFree = regular <= 0;
      return {
        id: r.id,
        slug: r.slug,
        title: (o && o.title) || r.title,
        regularPrice: isFree ? 0 : regular,
        extendedPrice: isFree ? 0 : extended,
        categoryName: r.categoryName || "—",
        status: r.status || "APPROVED",
        isFree,
      };
    });
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Newest products appear first. Live prices from your database.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/categories">
            <Button variant="outline">Categories</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Regular</th>
              <th className="px-4 py-3">Extended</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No products yet.
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-400">/{item.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.categoryName}</td>
                  <td className="px-4 py-3 font-medium">
                    {item.isFree || item.regularPrice <= 0
                      ? "Free"
                      : formatPrice(item.regularPrice)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.isFree || item.regularPrice <= 0
                      ? "—"
                      : formatPrice(item.extendedPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {item.status || "APPROVED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${item.id}/edit`}
                      className="text-xs font-medium text-emerald-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
