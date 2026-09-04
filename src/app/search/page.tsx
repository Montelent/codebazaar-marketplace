import { ItemGrid } from "@/components/items/item-grid";
import { listProductCards } from "@/lib/product-store";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ term?: string; q?: string; sort?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const term = String(params.term || params.q || "")
    .trim()
    .toLowerCase();
  let items = await listProductCards();

  if (term) {
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(term) ||
        i.category.name.toLowerCase().includes(term) ||
        i.author.username.toLowerCase().includes(term) ||
        i.slug.toLowerCase().includes(term)
    );
  }

  const sort = params.sort ?? "relevance";
  if (sort === "bestselling") {
    items = [...items].sort((a, b) => b.salesCount - a.salesCount);
  }
  if (sort === "price_asc") {
    items = [...items].sort((a, b) => {
      const pa = Number(a.salePriceRegular ?? a.regularPrice) || 0;
      const pb = Number(b.salePriceRegular ?? b.regularPrice) || 0;
      return pa - pb;
    });
  }
  if (sort === "price_desc") {
    items = [...items].sort((a, b) => {
      const pa = Number(a.salePriceRegular ?? a.regularPrice) || 0;
      const pb = Number(b.salePriceRegular ?? b.regularPrice) || 0;
      return pb - pa;
    });
  }
  if (sort === "rating") {
    items = [...items].sort((a, b) => b.ratingAvg - a.ratingAvg);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {term ? `Results for “${params.term || params.q}”` : "Search"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">{items.length} items</p>
      <ItemGrid items={items} emptyMessage="No items match your search." />
    </div>
  );
}
