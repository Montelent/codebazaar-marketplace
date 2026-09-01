"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "ADMIN" | "BUYER" | "EDITOR" | "AUTHOR";
  status: "active" | "disabled";
};

const SEED: UserRow[] = [
  { id: "1", name: "Store Admin", email: "admin@codebazaar.com", username: "admin", role: "ADMIN", status: "active" },
  { id: "2", name: "Pixel Craft", email: "pixel@example.com", username: "pixelcraft", role: "AUTHOR", status: "active" },
  { id: "3", name: "Content Editor", email: "editor@codebazaar.com", username: "editor", role: "EDITOR", status: "active" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>(SEED);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", username: "", role: "BUYER" as UserRow["role"], password: "",
  });
  const [msg, setMsg] = useState("");

  function addUser(e: React.FormEvent) {
    e.preventDefault();
    const row: UserRow = {
      id: String(Date.now()),
      name: form.name,
      email: form.email,
      username: form.username,
      role: form.role,
      status: "active",
    };
    setUsers((u) => [row, ...u]);
    setForm({ name: "", email: "", username: "", role: "BUYER", password: "" });
    setShowForm(false);
    setMsg("User added");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">Admins, buyers, authors & editors</p>
        </div>
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      {showForm && (
        <form onSubmit={addUser} className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Username</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRow["role"] })}>
                <option value="BUYER">Buyer</option>
                <option value="AUTHOR">Author</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Temp password</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create user</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {msg && <p className="text-sm text-emerald-700">{msg}</p>}

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-slate-400">@{u.username}</div>
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{u.role}</span></td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{u.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setUsers((list) => list.filter((x) => x.id !== u.id))}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
