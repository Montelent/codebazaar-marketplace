import Link from "next/link";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { ItemGrid } from "@/components/items/item-grid";

export const metadata = { title: "Wishlist · Account" };

export default function WishlistPage() {
  const items = MOCK_ITEMS.slice(0, 4);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Wishlist</h2>
        <p className="mt-1 text-sm text-slate-500">
          Save items for later. (Demo shows sample items until wishlist API is wired.)
        </p>
      </div>
      <ItemGrid items={items} />
      <Link href="/search" className="text-sm text-emerald-600 hover:underline">
        Find more items →
      </Link>
    </div>
  );
}
