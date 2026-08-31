"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { name: "PHP Scripts", slug: "php-scripts", subs: ["Laravel", "CodeIgniter", "WordPress Plugins", "Utilities"] },
  { name: "WordPress", slug: "wordpress", subs: ["Themes", "Plugins", "Page Builders", "WooCommerce"] },
  { name: "JavaScript", slug: "javascript", subs: ["React", "Vue", "Angular", "Vanilla JS", "Node.js"] },
  { name: "HTML5", slug: "html5", subs: ["Landing Pages", "Admin Templates", "Email Templates"] },
  { name: "Mobile", slug: "mobile", subs: ["React Native", "Flutter", "Ionic", "Swift"] },
  { name: "AI Tools", slug: "ai-tools", subs: ["Chatbots", "Image Generators", "ML Models", "Prompts"] },
  { name: "Plugins", slug: "plugins", subs: ["Browser Extensions", "VS Code", "Figma"] },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const itemCount = useCartStore((s) => s.items.length);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold text-emerald-700">
              CodeBazaar
            </Link>
            <span className="hidden sm:inline">Digital marketplace for code & creatives</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/seller/dashboard" className="hover:text-emerald-600">
              Become a Seller
            </Link>
            <Link href="/pricing/licenses" className="hidden sm:inline hover:text-emerald-600">
              Licenses
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Package className="h-7 w-7 text-emerald-600" />
          <span className="hidden text-lg font-bold text-slate-900 sm:inline">CodeBazaar</span>
        </Link>

        <form onSubmit={handleSearch} className="mx-auto hidden flex-1 max-w-xl md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search scripts, themes, plugins..."
              className="pl-10 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/cart" className="relative rounded-md p-2 hover:bg-slate-100">
            <ShoppingCart className="h-5 w-5 text-slate-700" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <nav className="hidden border-t border-slate-100 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              className="relative"
              onMouseEnter={() => setActiveMega(cat.slug)}
              onMouseLeave={() => setActiveMega(null)}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-emerald-700"
              >
                {cat.name}
                <ChevronDown className="h-3.5 w-3.5" />
              </Link>
              {activeMega === cat.slug && (
                <div className="absolute left-0 top-full z-50 min-w-[280px] rounded-b-lg border border-t-0 border-slate-200 bg-white p-4 shadow-lg">
                  <div className="mb-3 flex gap-3 text-xs font-medium">
                    <Link href={`/category/${cat.slug}?sort=newest`} className="text-emerald-600 hover:underline">
                      Browse New
                    </Link>
                    <Link href={`/category/${cat.slug}?sort=bestselling`} className="text-emerald-600 hover:underline">
                      Bestsellers
                    </Link>
                  </div>
                  <ul className="grid grid-cols-2 gap-1">
                    {cat.subs.map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`/category/${cat.slug}/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                          className="block rounded px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          <nav className="max-h-[60vh] overflow-y-auto px-4 pb-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.slug} className="border-b border-slate-100 py-2">
                <Link
                  href={`/category/${cat.slug}`}
                  className="block py-1.5 font-medium text-slate-800"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.name}
                </Link>
                <div className="ml-3 flex flex-col gap-1">
                  {cat.subs.map((sub) => (
                    <Link
                      key={sub}
                      href={`/category/${cat.slug}/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                      className="py-1 text-sm text-slate-500"
                      onClick={() => setMobileOpen(false)}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
