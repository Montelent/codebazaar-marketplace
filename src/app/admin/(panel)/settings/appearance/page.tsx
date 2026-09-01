import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import Link from "next/link";

export const metadata = { title: "Appearance · Admin" };

export default async function AppearanceSettingsPage() {
  const s = await getAllSettings();
  return (
    <div className="space-y-4">
      <Link href="/admin/settings" className="text-sm text-emerald-600 hover:underline">
        ← All settings
      </Link>
      <SettingsForm
        title="Homepage appearance"
        description="Hero image, background colors, brand colors, and hero copy"
        initial={{
          "homepage.heroTitle": s["homepage.heroTitle"] ?? "",
          "homepage.heroHighlight": s["homepage.heroHighlight"] ?? "",
          "homepage.heroSubtitle": s["homepage.heroSubtitle"] ?? "",
          "homepage.heroSearchPlaceholder": s["homepage.heroSearchPlaceholder"] ?? "",
          "homepage.heroImageUrl": s["homepage.heroImageUrl"] ?? "",
          "homepage.heroBgColor": s["homepage.heroBgColor"] ?? "#0f172a",
          "homepage.heroOverlay": s["homepage.heroOverlay"] ?? "0.55",
          "homepage.primaryColor": s["homepage.primaryColor"] ?? "#059669",
          "homepage.accentColor": s["homepage.accentColor"] ?? "#10b981",
          "homepage.buttonColor": s["homepage.buttonColor"] ?? "#059669",
          "homepage.buttonTextColor": s["homepage.buttonTextColor"] ?? "#ffffff",
          "homepage.heroCtaText": s["homepage.heroCtaText"] ?? "Search",
          "homepage.heroCtaLink": s["homepage.heroCtaLink"] ?? "/search",
        }}
        fields={[
          { key: "homepage.heroTitle", label: "Hero title" },
          { key: "homepage.heroHighlight", label: "Hero highlight text (optional emphasis)" },
          { key: "homepage.heroSubtitle", label: "Hero subtitle", type: "textarea" },
          { key: "homepage.heroSearchPlaceholder", label: "Search box placeholder" },
          {
            key: "homepage.heroImageUrl",
            label: "Hero background image URL",
            type: "url",
            help: "Full image URL (https://…). Leave empty for solid color only.",
          },
          {
            key: "homepage.heroBgColor",
            label: "Hero background color",
            help: "Hex color e.g. #0f172a",
          },
          {
            key: "homepage.heroOverlay",
            label: "Hero dark overlay strength",
            help: "0 to 1 (e.g. 0.55)",
          },
          { key: "homepage.primaryColor", label: "Primary brand color", help: "Hex e.g. #059669" },
          { key: "homepage.accentColor", label: "Accent color", help: "Hex e.g. #10b981" },
          { key: "homepage.buttonColor", label: "Hero button background" },
          { key: "homepage.buttonTextColor", label: "Hero button text color" },
          { key: "homepage.heroCtaText", label: "Hero search button label" },
          { key: "homepage.heroCtaLink", label: "Hero CTA link (if not search)" },
        ]}
      />
    </div>
  );
}
