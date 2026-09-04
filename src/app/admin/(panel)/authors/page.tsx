"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CKEditorField } from "@/components/editor/ck-editor";
import { Plus } from "lucide-react";
import { MOCK_ITEMS } from "@/lib/mock-data";

type Author = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  isElite: boolean;
  role: "AUTHOR" | "EDITOR";
};

function seedAuthors(): Author[] {
  const map = new Map<string, Author>();
  for (const item of MOCK_ITEMS) {
    if (!map.has(item.author.username)) {
      map.set(item.author.username, {
        id: item.author.username,
        username: item.author.username,
        displayName: item.author.username,
        email: `${item.author.username}@example.com`,
        bio: "",
        isElite: true,
        role: "AUTHOR",
      });
    }
  }
  return Array.from(map.values());
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>(seedAuthors);
  const [editing, setEditing] = useState<Author | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    bio: "",
    isElite: false,
    role: "AUTHOR" as "AUTHOR" | "EDITOR",
  });
  const [msg, setMsg] = useState("");

  function saveNew(e: React.FormEvent) {
    e.preventDefault();
    setAuthors((a) => [
      {
        id: form.username,
        username: form.username,
        displayName: form.displayName || form.username,
        email: form.email,
        bio: form.bio,
        isElite: form.isElite,
        role: form.role,
      },
      ...a,
    ]);
    setShowNew(false);
    setForm({
      username: "",
      displayName: "",
      email: "",
      bio: "",
      isElite: false,
      role: "AUTHOR",
    });
    setMsg("Author/editor saved");
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setAuthors((list) => list.map((a) => (a.id === editing.id ? editing : a)));
    setEditing(null);
    setMsg("Updated");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Authors & Editors</h1>
          <p className="text-sm text-slate-500">Profiles shown on product and portfolio pages</p>
        </div>
        <Button type="button" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" /> Add author/editor
        </Button>
      </div>
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      {showNew && (
        <form onSubmit={saveNew} className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Username</label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Display name</label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as "AUTHOR" | "EDITOR" })
                }
              >
                <option value="AUTHOR">Author</option>
                <option value="EDITOR">Editor</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isElite}
              onChange={(e) => setForm({ ...form, isElite: e.target.checked })}
              className="accent-emerald-600"
            />
            Elite author badge
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium">Bio (TinyMCE)</label>
            <CKEditorField
              value={form.bio}
              onChange={(html) => setForm({ ...form, bio: html })}
              minHeight={140}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {editing && (
        <form
          onSubmit={saveEdit}
          className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/30 p-6 shadow-sm"
        >
          <h2 className="font-semibold">Edit {editing.username}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Display name</label>
              <Input
                value={editing.displayName}
                onChange={(e) => setEditing({ ...editing, displayName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.isElite}
              onChange={(e) => setEditing({ ...editing, isElite: e.target.checked })}
              className="accent-emerald-600"
            />{" "}
            Elite author
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium">Bio</label>
            <CKEditorField
              value={editing.bio}
              onChange={(html) => setEditing({ ...editing, bio: html })}
              minHeight={140}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Update</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Elite</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {authors.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{a.displayName}</div>
                  <Link
                    href={`/author/${a.username}`}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    @{a.username}
                  </Link>
                </td>
                <td className="px-4 py-3">{a.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{a.role}</span>
                </td>
                <td className="px-4 py-3">{a.isElite ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-xs font-medium text-emerald-600 hover:underline"
                    onClick={() => setEditing(a)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
