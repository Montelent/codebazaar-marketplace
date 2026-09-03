import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { query } from "@/lib/db";
import { listProductCards } from "@/lib/product-store";

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
};

export default async function AdminProductsPage() {
  const rows: Row[] = [];
  const seen = new Set<string>();

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
      ORDER BY i."updatedAt" DESC
      LIMIT 300
    `);
    for (const r of dbRows) {
      seen.add(r.slug);
      rows.push({
        id: r.id,
        slug: r.slug,
        title: r.title,
        regularPrice: Number(r.regularPrice),
        extendedPrice: Number(r.extendedPrice),
        categoryName: r.categoryName || "—",
        status: r.status || "APPROVED",
      });
    }
  } catch {
    /* ignore */
  }

  try {
    const cards = await listProductCards();
    for (const c of cards) {
      if (seen.has(c.slug)) continue;
      seen.add(c.slug);
      rows.push({
        id: c.id,
        slug: c.slug,
        title: c.title,
        regularPrice: Number(c.regularPrice),
        extendedPrice: Number(c.extendedPrice),
        categoryName: c.category?.name || "—",
        status: "APPROVED",
      });
    }
  } catch {
    /* ignore */
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Manage items on your marketplace. Prices update after you save.
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
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((item) => {
              const free = Number(item.regularPrice) <= 0;
              return (
                <tr key={item.slug + item.id} className="hover:bg-slate-50/50">
                  <td className="max-w-xs px-4 py-3">
                    <Link
                      href={`/item/${item.slug}/${item.id}`}
                      className="line-clamp-1 font-medium hover:text-emerald-700"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs text-slate-400">{item.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.categoryName}</td>
                  <td className="px-4 py-3">
                    {free ? (
                      <span className="font-semibold text-emerald-700">Free</span>
                    ) : (
                      <>
                        {formatPrice(Number(item.regularPrice))}
                        <span className="text-xs text-slate-400">
                          {" "}
                          / {formatPrice(Number(item.extendedPrice))}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {item.status === "APPROVED" ? "Published" : item.status}
                    </span>
                  </td>
                  <td className="space-x-2 px-4 py-3">
                    <Link
                      href={`/admin/products/${item.id}/edit`}
                      className="text-xs font-medium text-emerald-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/item/${item.slug}/${item.id}`}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="text-emerald-600 hover:underline">
                    Add a product
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
