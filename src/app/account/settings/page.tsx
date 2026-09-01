"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountSettingsPage() {
  const { data } = useSession();
  const [name, setName] = useState(data?.user?.name ?? "");
  const [msg, setMsg] = useState("");

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Profile saved (connect profile API to persist)");
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Account settings</h2>
      <p className="mt-1 text-sm text-slate-500">Update your display name and password.</p>
      <form onSubmit={onSave} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input value={data?.user?.email ?? ""} disabled className="mt-1 bg-slate-50" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Display name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">New password</label>
          <Input type="password" placeholder="Leave blank to keep current" className="mt-1" />
        </div>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
