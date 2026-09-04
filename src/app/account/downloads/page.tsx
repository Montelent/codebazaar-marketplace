"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OwnedItem = {
  id: string;
  itemId: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  licenseType: string;
  price: number;
  purchasedAt: string;
  status?: string;
};

export default function DownloadsPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<OwnedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailLookup, setEmailLookup] = useState("");
  const [dlError, setDlError] = useState("");

  async function load(email?: string) {
    setLoading(true);
    setError("");
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/orders${q}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not load downloads from database");
        setItems([]);
        return;
      }
      setItems(data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.email) load();
    else setLoading(false);
  }, [session, status]);

  async function handleDownload(item: OwnedItem) {
    setDlError("");
    const email = session?.user?.email || emailLookup.trim();
    const q = email ? `?email=${encodeURIComponent(email)}` : "";
    const endpoint = `/api/download/${encodeURIComponent(item.itemId)}${q}`;

    try {
      const res = await fetch(endpoint, { redirect: "follow" });
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => ({}));
        setDlError(
          data.error ||
            "No download file URL on this product. Set Main download file URL in Admin → Products → Edit, then Save."
        );
        return;
      }

      if (res.url && res.ok && !res.url.includes("/api/download/")) {
        window.open(res.url, "_blank", "noopener,noreferrer");
        return;
      }

      window.location.href = endpoint;
    } catch {
      window.location.href = endpoint;
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Downloads</h2>
      <p className="mt-1 text-sm text-slate-500">
        Your purchased files. Download opens the main file URL set on each product in Admin.
      </p>

      {!session?.user && (
        <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            <Link href="/sign-in" className="font-medium text-emerald-700 hover:underline">
              Sign in
            </Link>{" "}
            or look up by the email used at checkout:
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (emailLookup.trim()) load(emailLookup.trim());
            }}
          >
            <Input
              type="email"
              placeholder="you@example.com"
              value={emailLookup}
              onChange={(e) => setEmailLookup(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" variant="outline" size="sm">
              Load
            </Button>
          </form>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
      )}
      {dlError && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{dlError}</p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          No downloads in the database yet. Complete checkout with your email first.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 p-3"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-slate-100">
                <Image
                  src={item.thumbnailUrl || "https://picsum.photos/seed/item/160/100"}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/item/${item.slug}/${item.itemId}`}
                  className="font-medium text-slate-900 hover:text-emerald-700"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {item.licenseType} · {new Date(item.purchasedAt).toLocaleDateString()}
                </p>
              </div>
              <Button size="sm" type="button" onClick={() => handleDownload(item)}>
                <Download className="h-4 w-4" />
                Download file
              </Button>
              <Link
                href={`/item/${item.slug}/${item.itemId}`}
                className="text-xs text-slate-500 hover:text-emerald-700"
                title="Product page"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
