"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type UserRow = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  emailVerified: boolean;
  newsletter: boolean;
  createdAt?: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        setUsers(d.users || []);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">
          Registered buyers and staff from the database ({users.length})
        </p>
      </div>
      {error && (
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
      )}
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Newsletter</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-slate-500">@{u.username}</div>
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.emailVerified ? (
                      <span className="text-emerald-600">Yes</span>
                    ) : (
                      <span className="text-amber-600">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{u.newsletter ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No users in database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Button type="button" variant="outline" onClick={() => location.reload()}>
        Refresh
      </Button>
    </div>
  );
}
