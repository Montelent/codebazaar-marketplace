import { NextResponse } from "next/server";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const all = await getAllSettings();
  const publicKeys = [
    "general.siteName",
    "general.tagline",
    "general.logoUrl",
    "header.announcement",
    "header.announcementEnabled",
    "nav.main",
    "nav.utility",
    "nav.categories",
    "footer.aboutText",
    "footer.columns",
    "footer.social",
    "footer.copyright",
    "homepage.heroTitle",
    "homepage.heroHighlight",
    "homepage.heroSubtitle",
    "homepage.heroCtaText",
    "homepage.heroCtaLink",
    "homepage.heroImageUrl",
    "homepage.heroBgColor",
    "homepage.heroOverlay",
    "homepage.primaryColor",
    "homepage.accentColor",
    "homepage.buttonColor",
    "homepage.buttonTextColor",
    "homepage.heroSearchPlaceholder",
    "homepage.statsSold",
    "homepage.statsEarnings",
  ];
  const settings: Record<string, unknown> = {};
  for (const k of publicKeys) {
    if (k in all) settings[k] = all[k];
  }
  return NextResponse.json(
    { settings },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
