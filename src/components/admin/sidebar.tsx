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
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  icon: LucideIcon;
  children: { href: string; label: string }[];
};

type NavItem = NavLink | NavGroup;

function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item && Array.isArray(item.children);
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    label: "Catalog",
    icon: Package,
    children: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/products/new", label: "Add product" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/tags", label: "Tags" },
      { href: "/admin/attributes", label: "Attributes" },
    ],
  },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/authors", label: "Authors & Editors", icon: UserCircle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  {
    label: "Storefront",
    icon: Home,
    children: [
      { href: "/admin/settings/homepage", label: "Homepage content" },
      { href: "/admin/settings/appearance", label: "Colors & hero" },
      { href: "/admin/settings/navigation", label: "Menus" },
      { href: "/admin/settings/header-footer", label: "Header & Footer" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { href: "/admin/settings", label: "All settings" },
      { href: "/admin/settings/general", label: "General" },
      { href: "/admin/settings/seo", label: "Technical SEO" },
      { href: "/admin/settings/schema", label: "Schema markup" },
      { href: "/admin/settings/payments", label: "Payments" },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
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
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
        {NAV.map((item) => {
          if (isNavGroup(item)) {
            return (
              <div key={item.label} className="pt-2">
                <div className="mb-1 flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                <div className="space-y-0.5">
                  {item.children.map((child) => {
                    const active = isActive(pathname, child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={
                          active
                            ? "block rounded-md bg-emerald-600/20 px-3 py-1.5 font-medium text-emerald-300"
                            : "block rounded-md px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
                        }
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex items-center gap-2 rounded-md bg-emerald-600/20 px-3 py-2 font-medium text-emerald-300"
                  : "flex items-center gap-2 rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> View storefront
        </a>
      </div>
    </aside>
  );
}
