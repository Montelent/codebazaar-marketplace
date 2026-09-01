"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Could not create account"
        );
        setLoading(false);
        return;
      }
      const login = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      setLoading(false);
      if (login?.error) {
        router.push("/sign-in");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Network error");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-slate-900">
        Create your CodeBazaar account
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Buy items, download files, and manage your licenses.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Username</label>
          <Input
            required
            value={form.username}
            onChange={(e) =>
              set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
            }
            className="mt-1"
            placeholder="yourname"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <Input
            required
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="mt-1"
            minLength={8}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Confirm password</label>
          <Input
            required
            type="password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            className="mt-1"
          />
        </div>
        {error && (
          <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-emerald-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
