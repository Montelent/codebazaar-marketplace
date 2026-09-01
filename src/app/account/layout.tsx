import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/purchases", label: "Purchases" },
  { href: "/account/downloads", label: "Downloads" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/settings", label: "Settings" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/account");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My account</h1>
          <p className="text-sm text-slate-500">Signed in as {session.user.email}</p>
        </div>
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          ← Back to marketplace
        </Link>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-48 lg:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
