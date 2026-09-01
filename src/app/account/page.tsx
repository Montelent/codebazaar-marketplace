import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "My account · CodeBazaar" };

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);
  const sample = MOCK_ITEMS.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage licenses, download files, and update your profile — CodeCanyon-style buyer hub.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Purchases" value="0" href="/account/purchases" />
          <Stat label="Downloads available" value="0" href="/account/downloads" />
          <Stat label="Wishlist" value={String(sample.length)} href="/account/wishlist" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Suggested for you</h3>
          <Link href="/search" className="text-sm text-emerald-600 hover:underline">
            Browse all
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {sample.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <Link
                  href={`/item/${item.slug}/${item.id}`}
                  className="line-clamp-1 text-sm font-medium text-slate-900 hover:text-emerald-700"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500">{item.category.name}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold">
                {formatPrice(Number(item.salePriceRegular ?? item.regularPrice))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 hover:border-emerald-200 hover:bg-emerald-50/40"
    >
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </Link>
  );
}
