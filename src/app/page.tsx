export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { Search, ArrowRight, Shield, BookOpen, Star } from "lucide-react";
import { CATEGORY_CARDS } from "@/lib/mock-data";
import { ItemCard } from "@/components/items/item-card";
import { getAllSettings } from "@/lib/settings";
import { listProductCards } from "@/lib/product-store";
import { stripHtml } from "@/lib/utils";

export default async function HomePage() {
  const s = await getAllSettings();
  const allItems = await listProductCards();
  const featured = allItems.slice(0, 4);
  const bestsellers = [...allItems].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);

  const heroTitle = stripHtml(
    String(s["homepage.heroTitle"] ?? "Code that powers your next product")
  );
  const heroHighlight = stripHtml(
    String(s["homepage.heroHighlight"] ?? "your next product")
  );
  const heroSubtitle = stripHtml(
    String(
      s["homepage.heroSubtitle"] ??
        "Discover premium scripts, themes, plugins, and templates from world-class independent creators."
    )
  );
  const heroImage = String(s["homepage.heroImageUrl"] ?? "");
  const heroBg = String(s["homepage.heroBgColor"] ?? "#0f172a");
  const useGradient = Boolean(s["homepage.heroUseGradient"]);
  const gradientRaw = String(s["homepage.heroGradient"] ?? "#0f172a|#059669|135");
  let heroBackground: string = heroBg;
  if (useGradient) {
    if (gradientRaw.includes("gradient")) {
      heroBackground = gradientRaw;
    } else {
      const [from, to, angle] = gradientRaw.split("|");
      heroBackground = `linear-gradient(${angle || 135}deg, ${from || "#0f172a"}, ${to || "#059669"})`;
    }
  }
  const overlay = Number(s["homepage.heroOverlay"] ?? 0.55);
  const buttonColor = String(s["homepage.buttonColor"] ?? "#059669");
  const buttonText = String(s["homepage.buttonTextColor"] ?? "#ffffff");
  const accent = String(s["homepage.accentColor"] ?? "#10b981");
  const ctaText = stripHtml(String(s["homepage.heroCtaText"] ?? "Search"));
  const placeholder = stripHtml(
    String(s["homepage.heroSearchPlaceholder"] ?? "Search scripts, themes, plugins…")
  );
  const siteName = stripHtml(String(s["general.siteName"] ?? "CodeBazaar"));

  const titleParts =
    heroHighlight &&
    heroTitle !== heroHighlight &&
    heroTitle.includes(heroHighlight)
      ? heroTitle.split(heroHighlight)
      : [heroTitle, ""];
  const showHighlight =
    Boolean(heroHighlight) &&
    (heroTitle === heroHighlight ||
      (titleParts.length > 1 && heroTitle.includes(heroHighlight)));

  return (
    <div className="pb-16">
      <section
        className="relative overflow-hidden text-white"
        style={
          useGradient
            ? { backgroundImage: heroBackground }
            : { backgroundColor: heroBg }
        }
      >
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(15, 23, 42, ${Number.isFinite(overlay) ? overlay : 0.55})`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-2 text-sm font-medium" style={{ color: accent }}>
              {siteName}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {heroTitle === heroHighlight ? (
                <span style={{ color: accent }}>{heroTitle}</span>
              ) : (
                <>
                  {titleParts[0]}
                  {showHighlight && heroTitle !== heroHighlight ? (
                    <span style={{ color: accent }}>{heroHighlight}</span>
                  ) : null}
                  {titleParts[1] || ""}
                </>
              )}
            </h1>
            <p className="mt-4 text-lg text-slate-200">{heroSubtitle}</p>
            <form
              action="/search"
              className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-xl bg-white shadow-lg"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  name="q"
                  type="search"
                  placeholder={placeholder}
                  className="h-14 w-full border-0 bg-transparent pl-12 pr-4 text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 font-semibold transition hover:opacity-90"
                style={{ backgroundColor: buttonColor, color: buttonText }}
              >
                {ctaText}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Browse by category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-md"
            >
              <span className="text-2xl">{cat.icon}</span>
              <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-emerald-700">
                {cat.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Featured items</h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Bestsellers</h2>
          <Link
            href="/search"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Quality checked",
              text: "Every item is reviewed before it goes live.",
            },
            {
              icon: BookOpen,
              title: "Docs & support",
              text: "Clear documentation and author support options.",
            },
            {
              icon: Star,
              title: "Trusted marketplace",
              text: "Thousands of downloads from creators worldwide.",
            },
          ].map((b) => (
            <div key={b.title} className="flex gap-3">
              <b.icon className="h-8 w-8 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">{b.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
