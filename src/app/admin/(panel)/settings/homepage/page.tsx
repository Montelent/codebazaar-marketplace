import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Homepage · Admin" };

export default async function HomepageSettingsPage() {
  const s = await getAllSettings();
  return (
    <SettingsForm
      title="Homepage"
      description="Hero, sections visibility, and trust blocks"
      initial={{
        "homepage.heroTitle": s["homepage.heroTitle"],
        "homepage.heroHighlight": s["homepage.heroHighlight"],
        "homepage.heroSubtitle": s["homepage.heroSubtitle"],
        "homepage.heroCtaText": s["homepage.heroCtaText"],
        "homepage.heroCtaLink": s["homepage.heroCtaLink"],
        "homepage.showCategories": s["homepage.showCategories"],
        "homepage.showFeatured": s["homepage.showFeatured"],
        "homepage.showBestsellers": s["homepage.showBestsellers"],
        "homepage.showTrustBlocks": s["homepage.showTrustBlocks"],
        "homepage.statsSold": s["homepage.statsSold"],
        "homepage.statsEarnings": s["homepage.statsEarnings"],
      }}
      fields={[
        { key: "homepage.heroTitle", label: "Hero title" },
        { key: "homepage.heroHighlight", label: "Hero highlight word/phrase" },
        { key: "homepage.heroSubtitle", label: "Hero subtitle", type: "textarea" },
        { key: "homepage.heroCtaText", label: "Search button label" },
        { key: "homepage.heroCtaLink", label: "Search action link" },
        { key: "homepage.showCategories", label: "Show category grid", type: "checkbox" },
        { key: "homepage.showFeatured", label: "Show featured items", type: "checkbox" },
        { key: "homepage.showBestsellers", label: "Show bestsellers", type: "checkbox" },
        { key: "homepage.showTrustBlocks", label: "Show trust blocks", type: "checkbox" },
        { key: "homepage.statsSold", label: "Footer items sold (display)", type: "number" },
        { key: "homepage.statsEarnings", label: "Footer community earnings (display)", type: "number" },
      ]}
    />
  );
}
