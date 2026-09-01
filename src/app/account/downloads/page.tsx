"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Download } from "lucide-react";
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Downloads</h2>
      <p className="mt-1 text-sm text-slate-500">
        Loaded from the database — available on any device with the same account/email.
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
              placeholder="you@email.com"
              value={emailLookup}
              onChange={(e) => setEmailLookup(e.target.value)}
            />
            <Button type="submit" variant="outline">
              Load
            </Button>
          </form>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Loading from database…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-600">
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
                <Image src={item.thumbnailUrl} alt="" fill className="object-cover" />
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
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob(
                    [
                      `CodeBazaar License\nProduct: ${item.title}\nLicense: ${item.licenseType}\n`,
                      `Purchased: ${item.purchasedAt}\nItem ID: ${item.itemId}\n`,
                      `\nStored in database — valid on any device with this account.\n`,
                    ],
                    { type: "text/plain" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${item.slug}-license.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Button size="sm" type="button">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
