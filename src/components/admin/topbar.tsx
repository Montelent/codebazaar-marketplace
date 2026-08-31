"use client";

import { AdminSignOut } from "@/components/admin/sign-out-button";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

export function AdminTopbar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button type="button" className="rounded p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm text-slate-500 lg:hidden">Admin</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-600 sm:inline">{email}</span>
        <Link href="/" className="text-sm text-emerald-600 hover:underline">Store</Link>
        <AdminSignOut />
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-14 border-b border-slate-200 bg-white p-4 shadow lg:hidden">
          <nav className="grid gap-2 text-sm">
            {[["/admin","Dashboard"],["/admin/products","Products"],["/admin/orders","Orders"],["/admin/blog","Blog"],["/admin/pages","Pages"],["/admin/settings","Settings"],["/admin/settings/payments","Payments"]].map(([href,label]) => (
              <Link key={href} href={href} className="rounded px-2 py-1.5 hover:bg-slate-50" onClick={() => setOpen(false)}>{label}</Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
