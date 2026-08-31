import { ItemGrid } from "@/components/items/item-grid";
import { MOCK_ITEMS } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };

interface Props {
  searchParams: Promise<{ term?: string; sort?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const term = params.term?.toLowerCase() ?? "";
  let items = MOCK_ITEMS;
  if (term) {
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(term) ||
        i.category.name.toLowerCase().includes(term) ||
        i.author.username.toLowerCase().includes(term)
    );
  }
  const sort = params.sort ?? "relevance";
  if (sort === "bestselling") items = [...items].sort((a, b) => b.salesCount - a.salesCount);
  if (sort === "price_asc")
    items = [...items].sort((a, b) => Number(a.regularPrice) - Number(b.regularPrice));
  if (sort === "price_desc")
    items = [...items].sort((a, b) => Number(b.regularPrice) - Number(a.regularPrice));
  if (sort === "rating") items = [...items].sort((a, b) => b.ratingAvg - a.ratingAvg);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {term ? `Results for "${params.term}"` : "All items"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{items.length} items found</p>
      <div className="mb-4 mt-4 flex flex-wrap gap-2">
        {["relevance", "bestselling", "price_asc", "price_desc", "rating"].map((s) => (
          <a
            key={s}
            href={`/search?term=${encodeURIComponent(params.term ?? "")}&sort=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              sort === s ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {s.replace("_", " ")}
          </a>
        ))}
      </div>
      <ItemGrid items={items} emptyMessage="No items match your search." />
    </div>
  );
}
