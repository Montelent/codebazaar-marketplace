import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listProductCards } from "@/lib/product-store";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account · CodeBazaar" };

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);
  const cards = await listProductCards().catch(() => []);
  const suggested = cards.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage purchases, downloads, and your wishlist.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Purchases" href="/account/purchases" />
          <Stat label="Downloads" href="/account/downloads" />
          <Stat label="Wishlist" href="/account/wishlist" />
        </div>
      </div>

      {suggested.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Suggested for you</h3>
            <Link href="/search" className="text-sm text-emerald-600 hover:underline">
              Browse all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {suggested.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/item/${item.slug}/${item.id}`}
                    className="line-clamp-1 text-sm font-medium text-slate-900 hover:text-emerald-700"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-slate-500">{item.category?.name}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {Number(item.regularPrice) <= 0
                    ? "Free"
                    : formatPrice(Number(item.salePriceRegular ?? item.regularPrice))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 hover:border-emerald-200 hover:bg-emerald-50/40"
    >
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="text-xs text-slate-500">Open →</div>
    </Link>
  );
}
