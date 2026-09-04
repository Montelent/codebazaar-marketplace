import { ItemGrid } from "@/components/items/item-grid";
import { CATEGORY_CARDS } from "@/lib/mock-data";
import { listProductCards } from "@/lib/product-store";
import { query } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_CARDS.find((c) => c.slug === category);
  return { title: cat?.name ?? category, description: cat?.description };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;
  let catName = CATEGORY_CARDS.find((c) => c.slug === category)?.name;
  let catDesc = CATEGORY_CARDS.find((c) => c.slug === category)?.description;
  try {
    const { rows } = await query<{ name: string }>(
      `SELECT name FROM "Category" WHERE slug = $1 LIMIT 1`,
      [category]
    );
    if (rows[0]?.name) catName = rows[0].name;
  } catch {
    /* keep label */
  }

  let items = await listProductCards();
  items = items.filter(
    (i) =>
      i.category.slug === category ||
      i.category.name.toLowerCase().includes(category.replace(/-/g, " "))
  );

  const sort = sp.sort ?? "bestselling";
  if (sort === "bestselling") items = [...items].sort((a, b) => b.salesCount - a.salesCount);
  if (sort === "rating") items = [...items].sort((a, b) => b.ratingAvg - a.ratingAvg);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{catName ?? category}</span>
      </nav>
      <h1 className="text-3xl font-bold text-slate-900">{catName ?? category}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        {catDesc ?? "Browse items in this category."}
      </p>
      <div className="mb-4 mt-6 flex gap-2">
        <Link
          href={`/category/${category}?sort=newest`}
          className={`rounded-full px-3 py-1 text-xs font-medium ${sort === "newest" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}
        >
          Browse New
        </Link>
        <Link
          href={`/category/${category}?sort=bestselling`}
          className={`rounded-full px-3 py-1 text-xs font-medium ${sort === "bestselling" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}
        >
          Bestsellers
        </Link>
      </div>
      <p className="mb-4 text-sm text-slate-500">{items.length} items found</p>
      <ItemGrid items={items} emptyMessage="No products in this category yet." />
    </div>
  );
}
