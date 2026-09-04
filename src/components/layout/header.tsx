"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Search, ShoppingCart, Menu, X, ChevronDown, User, Package,
  Download, Heart, Settings, LogOut, ShoppingBag, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

type NavLink = { label: string; href: string };
type Cat = { name: string; slug: string; subs?: string[] };

const DEFAULT_CATS: Cat[] = [
  { name: "PHP Scripts", slug: "php-scripts", subs: ["Laravel", "CodeIgniter", "Utilities"] },
  { name: "WordPress", slug: "wordpress", subs: ["Themes", "Plugins", "WooCommerce"] },
  { name: "JavaScript", slug: "javascript", subs: ["React", "Vue", "Node.js"] },
  { name: "HTML5", slug: "html5", subs: ["Landing Pages", "Admin Templates"] },
  { name: "Mobile", slug: "mobile", subs: ["React Native", "Flutter"] },
  { name: "AI Tools", slug: "ai-tools", subs: ["Chatbots", "Prompts"] },
  { name: "Plugins", slug: "plugins", subs: ["Browser Extensions", "VS Code"] },
];

const DEFAULT_MAIN: NavLink[] = [
  { label: "All Items", href: "/search" },
  { label: "Popular", href: "/search?sort=bestselling" },
  { label: "Featured", href: "/search?sort=rating" },
  { label: "Pricing", href: "/pricing/licenses" },
];

const DEFAULT_UTILITY: NavLink[] = [
  { label: "Help Center", href: "/page/help" },
  { label: "Licenses", href: "/pricing/licenses" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [siteName, setSiteName] = useState("CodeBazaar");
  const [categories, setCategories] = useState<Cat[]>(DEFAULT_CATS);
  const [mainNav, setMainNav] = useState<NavLink[]>(DEFAULT_MAIN);
  const [utilityNav, setUtilityNav] = useState<NavLink[]>(DEFAULT_UTILITY);
  const accountRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((s) => s.itemCount());
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings || {};
        if (s["general.siteName"]) {
          const n = String(s["general.siteName"]).replace(/<[^>]+>/g, "").trim();
          if (n) setSiteName(n);
        }
        if (Array.isArray(s["nav.categories"]) && s["nav.categories"].length)
          setCategories(s["nav.categories"] as Cat[]);
        if (Array.isArray(s["nav.main"]) && s["nav.main"].length)
          setMainNav(s["nav.main"] as NavLink[]);
        if (Array.isArray(s["nav.utility"]) && s["nav.utility"].length)
          setUtilityNav(s["nav.utility"] as NavLink[]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <AnnouncementBar />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4 text-xs text-slate-600">
          <div className="flex items-center gap-4 overflow-x-auto">
            {utilityNav.map((l) => (
              <Link key={l.href + l.label} href={l.href} className="shrink-0 hover:text-emerald-700">{l.label}</Link>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/account/purchases" className="hidden hover:text-emerald-700 sm:inline">Purchases</Link>
                <Link href="/account/downloads" className="hidden hover:text-emerald-700 sm:inline">Downloads</Link>
                {isAdmin && <Link href="/admin" className="hover:text-emerald-700">Admin</Link>}
              </>
            ) : (
              <>
                <Link href="/sign-in" className="hover:text-emerald-700">Sign In</Link>
                <Link href="/sign-up" className="font-medium text-emerald-700 hover:underline">Create account</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <button type="button" className="rounded-md p-2 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Package className="h-6 w-6 text-emerald-600" />
          <span className="text-lg font-bold text-slate-900">{siteName}</span>
        </Link>
        <form onSubmit={handleSearch} className="mx-2 hidden min-w-0 flex-1 md:block">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input type="search" placeholder="Search scripts, themes, plugins…" className="h-10 pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/cart" className="relative rounded-md p-2 hover:bg-slate-100" aria-label="Cart">
            <ShoppingCart className="h-5 w-5 text-slate-700" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">{itemCount}</span>
            )}
          </Link>
          <div className="relative" ref={accountRef}>
            <button type="button" onClick={() => setAccountOpen((v) => !v)} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{status === "loading" ? "…" : session?.user ? session.user.name?.split(" ")[0] || "Account" : "Account"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
                {session?.user ? (
                  <>
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{session.user.name || "Member"}</p>
                      <p className="truncate text-xs text-slate-500">{session.user.email}</p>
                    </div>
                    <AccountLink href="/account" icon={LayoutDashboard} onClick={() => setAccountOpen(false)}>Dashboard</AccountLink>
                    <AccountLink href="/account/purchases" icon={ShoppingBag} onClick={() => setAccountOpen(false)}>Purchases</AccountLink>
                    <AccountLink href="/account/downloads" icon={Download} onClick={() => setAccountOpen(false)}>Downloads</AccountLink>
                    <AccountLink href="/account/wishlist" icon={Heart} onClick={() => setAccountOpen(false)}>Wishlist</AccountLink>
                    <AccountLink href="/account/settings" icon={Settings} onClick={() => setAccountOpen(false)}>Settings</AccountLink>
                    {isAdmin && <AccountLink href="/admin" icon={Package} onClick={() => setAccountOpen(false)}>Admin panel</AccountLink>}
                    <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => { setAccountOpen(false); signOut({ callbackUrl: "/" }); }}>
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 p-3">
                      <Link href="/sign-in" onClick={() => setAccountOpen(false)}><Button className="w-full" size="sm">Sign In</Button></Link>
                      <Link href="/sign-up" onClick={() => setAccountOpen(false)}><Button variant="outline" className="w-full" size="sm">Create account</Button></Link>
                    </div>
                    <div className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">Access purchases, downloads & wishlist</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="hidden border-t border-slate-100 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {categories.map((cat) => (
            <div key={cat.slug} className="relative" onMouseEnter={() => setActiveMega(cat.slug)} onMouseLeave={() => setActiveMega(null)}>
              <Link href={`/category/${cat.slug}`} className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-emerald-700">
                {cat.name}
                {cat.subs && cat.subs.length > 0 && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>
              {activeMega === cat.slug && cat.subs && cat.subs.length > 0 && (
                <div className="absolute left-0 top-full z-50 min-w-[240px] rounded-b-lg border border-t-0 border-slate-200 bg-white p-3 shadow-lg">
                  <div className="mb-2 flex gap-3 text-xs font-medium">
                    <Link href={`/category/${cat.slug}?sort=newest`} className="text-emerald-600 hover:underline">Browse New</Link>
                    <Link href={`/category/${cat.slug}?sort=bestselling`} className="text-emerald-600 hover:underline">Bestsellers</Link>
                  </div>
                  <ul className="space-y-1">
                    {cat.subs.map((sub) => (
                      <li key={sub}>
                        <Link href={`/category/${cat.slug}?q=${encodeURIComponent(sub)}`} className="block rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">{sub}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1">
            {mainNav.map((l) => (
              <Link key={l.href + l.label} href={l.href} className="px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-emerald-700">{l.label}</Link>
            ))}
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type="search" placeholder="Search…" className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </form>
          <div className="space-y-1">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="block rounded-md px-2 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>{cat.name}</Link>
            ))}
            {mainNav.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>{l.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function AccountLink({ href, icon: Icon, children, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
      <Icon className="h-4 w-4 text-slate-400" />
      {children}
    </Link>
  );
}
