"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("admin-credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (!res) {
        setError("Sign-in failed. Check NEXTAUTH_SECRET is set on Vercel.");
        setLoading(false);
        return;
      }

      if (res.error) {
        setError(
          "Invalid admin credentials. Use the exact ADMIN_EMAIL and ADMIN_PASSWORD from Vercel env."
        );
        setLoading(false);
        return;
      }

      // Full page navigation so the session cookie is sent on the next request
      // (client router.push often races the cookie and bounces back to login)
      window.location.assign(res.url || callbackUrl || "/admin");
    } catch {
      setError("Network error during sign-in. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Lock className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">
            CodeBazaar single-vendor control panel
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@codebazaar.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in to Admin"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="text-emerald-600 hover:underline">
            ← Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
