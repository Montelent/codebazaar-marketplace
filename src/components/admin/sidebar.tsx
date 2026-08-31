"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, FolderTree, Settings,
  ExternalLink, Newspaper, FileText,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { href: "/admin/settings", label: "General" },
      { href: "/admin/settings/homepage", label: "Homepage" },
      { href: "/admin/settings/header-footer", label: "Header & Footer" },
      { href: "/admin/settings/seo", label: "SEO" },
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
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-200 lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
        <Package className="h-5 w-5 text-emerald-400" />
        <span className="font-bold text-white">CodeBazaar</span>
        <span className="rounded bg-emerald-600/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
        {NAV.map((item) => {
          if ("children" in item && item.children) {
            return (
              <div key={item.label} className="pt-2">
                <div className="mb-1 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                {item.children.map((child) => (
                  <Link key={child.href} href={child.href}
                    className={`block rounded-md px-3 py-2 pl-8 transition ${
                      isActive(pathname, child.href) ? "bg-emerald-600/20 text-emerald-300" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}>{child.label}</Link>
                ))}
              </div>
            );
          }
          const Icon = item.icon!;
          return (
            <Link key={item.href} href={item.href!}
              className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive(pathname, item.href!, item.exact) ? "bg-emerald-600/20 font-medium text-emerald-300" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
          <ExternalLink className="h-4 w-4" /> View storefront
        </Link>
      </div>
    </aside>
  );
}
