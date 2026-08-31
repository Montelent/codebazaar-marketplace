import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEffectivePrice(
  regular: number | string,
  extended: number | string,
  saleRegular?: number | string | null,
  saleExtended?: number | string | null,
  license: "REGULAR" | "EXTENDED" = "REGULAR"
): { price: number; original?: number } {
  const reg = Number(regular);
  const ext = Number(extended);
  const sReg = saleRegular != null ? Number(saleRegular) : null;
  const sExt = saleExtended != null ? Number(saleExtended) : null;

  if (license === "EXTENDED") {
    if (sExt != null) return { price: sExt, original: ext };
    return { price: ext };
  }
  if (sReg != null) return { price: sReg, original: reg };
  return { price: reg };
}
