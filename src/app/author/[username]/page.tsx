import { ItemGrid } from "@/components/items/item-grid";
import { MOCK_ITEMS } from "@/lib/mock-data";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — Author portfolio | CodeBazaar`,
    description: `Browse digital products by ${username} on CodeBazaar.`,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { username } = await params;
  const items = MOCK_ITEMS.filter(
    (i) => i.author.username.toLowerCase() === username.toLowerCase()
  );
  const display = items;
  const totalSales = display.reduce((s, i) => s + i.salesCount, 0);
  const avgRating =
    display.length > 0
      ? display.reduce((s, i) => s + i.ratingAvg, 0) / display.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-800">Author</span>
        <span className="mx-2">›</span>
        <span className="text-slate-800">{username}</span>
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="mb-1 inline-flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{username}</h1>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                Author
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Member on CodeBazaar · {display.length} item{display.length === 1 ? "" : "s"}
            </p>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Independent creator shipping quality digital products on CodeBazaar.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <div><span className="font-bold text-slate-900">{display.length}</span> items</div>
          <div><span className="font-bold text-slate-900">{avgRating ? avgRating.toFixed(1) : "—"}</span> avg rating</div>
          <div><span className="font-bold text-slate-900">{totalSales > 0 ? `${(totalSales / 1000).toFixed(1)}K+` : "0"}</span> sales</div>
        </div>
      </div>

      <h2 className="mb-4 mt-10 text-xl font-bold">Items by {username}</h2>
      {display.length > 0 ? (
        <ItemGrid items={display} />
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No items found for this author yet.
        </p>
      )}

      <p className="mt-8">
        <Link href="/" className="text-emerald-600 hover:underline">← Back to marketplace</Link>
      </p>
    </div>
  );
}
