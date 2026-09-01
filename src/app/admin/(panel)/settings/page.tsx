import Link from "next/link";
import {
  Settings, Home, LayoutTemplate, Search, Code2, CreditCard,
  Package, Users, UserCircle, Newspaper, FileText, FolderTree,
} from "lucide-react";

export const metadata = { title: "Settings · Admin" };

const SECTIONS = [
  { href: "/admin/settings/general", title: "General", desc: "Site name, logo, currency, support email", icon: Settings },
  { href: "/admin/settings/homepage", title: "Homepage", desc: "Hero, featured sections, homepage layout", icon: Home },
  { href: "/admin/settings/header-footer", title: "Header & Footer", desc: "Navigation, footer links, social links", icon: LayoutTemplate },
  { href: "/admin/settings/seo", title: "Technical SEO", desc: "Titles, meta, robots, analytics, verification", icon: Search },
  { href: "/admin/settings/schema", title: "Schema markup", desc: "JSON-LD Product, Organization, Breadcrumb…", icon: Code2 },
  { href: "/admin/settings/payments", title: "Payments", desc: "Stripe keys, currency, checkout options", icon: CreditCard },
];

const QUICK = [
  { href: "/admin/products", title: "Products", icon: Package },
  { href: "/admin/users", title: "Users", icon: Users },
  { href: "/admin/authors", title: "Authors & Editors", icon: UserCircle },
  { href: "/admin/blog", title: "Blog", icon: Newspaper },
  { href: "/admin/pages", title: "Pages", icon: FileText },
  { href: "/admin/categories", title: "Categories", icon: FolderTree },
];

export default function SettingsHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Open any module from this grid — no need to type URLs</p>
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Configuration</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Content & people</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((s) => (
            <Link key={s.href} href={s.href} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700">
              <s.icon className="h-4 w-4 text-slate-400" />
              {s.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
