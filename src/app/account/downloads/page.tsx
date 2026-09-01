"use client";

import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import { usePurchasesStore } from "@/lib/purchases-store";
import { Button } from "@/components/ui/button";

export default function DownloadsPage() {
  const items = usePurchasesStore((s) => s.items);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Downloads</h2>
      <p className="mt-1 text-sm text-slate-500">
        Download source files for items you own. Re-download anytime while your license is valid.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-600">
          No downloads available. Purchase or claim a free item to unlock files.
          <div className="mt-3">
            <Link href="/" className="font-medium text-emerald-600 hover:underline">
              Browse marketplace
            </Link>
          </div>
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
                  {item.licenseType} license ·{" "}
                  {new Date(item.purchasedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob(
                    [
                      `CodeBazaar License\n`,
                      `Product: ${item.title}\n`,
                      `License: ${item.licenseType}\n`,
                      `Purchased: ${item.purchasedAt}\n`,
                      `\nThank you for your purchase.\n`,
                      `Replace this with your real ZIP download URL in admin.\n`,
                    ],
                    { type: "text/plain" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${item.slug}-${item.licenseType.toLowerCase()}-license.txt`;
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
