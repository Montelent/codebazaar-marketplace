import { ItemCard } from "./item-card";
import type { ItemCardData } from "@/types";

interface ItemGridProps {
  items: ItemCardData[];
  emptyMessage?: string;
}

export function ItemGrid({ items, emptyMessage = "No items found." }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
        <p className="text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
