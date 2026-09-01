import { NextResponse } from "next/server";
import { getAllSettings } from "@/lib/settings";

/** Public settings for storefront (header, homepage appearance, nav). */
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
  ];
  const settings: Record<string, unknown> = {};
  for (const k of publicKeys) {
    if (k in all) settings[k] = all[k];
  }
  return NextResponse.json({ settings });
}
