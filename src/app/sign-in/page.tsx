"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    const cb =
      new URLSearchParams(window.location.search).get("callbackUrl") || "/account";
    router.push(cb);
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-slate-900">Sign in to CodeBazaar</h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Access purchases, downloads, wishlist, and account settings.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{" "}
        <Link href="/sign-up" className="font-medium text-emerald-600 hover:underline">
          Create one
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-400">
        <Link href="/admin/login" className="hover:underline">
          Admin login
        </Link>
      </p>
    </div>
  );
}
