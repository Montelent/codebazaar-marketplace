"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  ExternalLink,
  Newspaper,
  FileText,
  Users,
  UserCircle,
  Home,
  FolderTree,
  Tags,
  ListChecks,
  PlusCircle,
  CreditCard,
  Search,
  Palette,
  Menu,
} from "lucide-react";

type LinkItem = { href: string; label: string; icon?: LucideIcon };

const SECTIONS: { title: string; items: LinkItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Products",
    items: [
      { href: "/admin/products", label: "All products", icon: Package },
      { href: "/admin/products/new", label: "Add product", icon: PlusCircle },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/tags", label: "Tags", icon: Tags },
      { href: "/admin/attributes", label: "Attributes", icon: ListChecks },
    ],
  },
  {
    title: "Sales & people",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/authors", label: "Authors", icon: UserCircle },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/blog/categories", label: "Blog categories", icon: FolderTree },
      { href: "/admin/pages", label: "Pages", icon: FileText },
    ],
  },
  {
    title: "Storefront",
    items: [
      { href: "/admin/settings/homepage", label: "Homepage", icon: Home },
      { href: "/admin/settings/appearance", label: "Colors & hero", icon: Palette },
      { href: "/admin/settings/navigation", label: "Menus", icon: Menu },
      { href: "/admin/settings/header-footer", label: "Header & footer", icon: FileText },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/admin/settings", label: "All settings", icon: Settings },
      { href: "/admin/settings/general", label: "General", icon: Settings },
      { href: "/admin/settings/seo", label: "SEO", icon: Search },
      { href: "/admin/settings/schema", label: "Schema", icon: ListChecks },
      { href: "/admin/settings/payments", label: "Payments", icon: CreditCard },
    ],
  },
];

function active(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-200 lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
        <Package className="h-5 w-5 text-emerald-400" />
        <span className="font-bold text-white">CodeBazaar</span>
        <span className="rounded bg-emerald-600/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
          Admin
        </span>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3 pb-8 text-sm">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-emerald-500/90">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const on = active(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        on
                          ? "flex items-center gap-2 rounded-md bg-emerald-600/25 px-3 py-2 font-medium text-emerald-200"
                          : "flex items-center gap-2 rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-80" />}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> Open website
        </a>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const flat = SECTIONS.flatMap((s) => s.items);
  return (
    <div className="border-b border-slate-200 bg-white lg:hidden">
      <div className="flex gap-1 overflow-x-auto px-2 py-2 text-xs">
        {flat.map((item) => {
          const on = active(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                on
                  ? "shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 font-medium text-white"
                  : "shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
