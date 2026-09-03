import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appearance · Admin" };

export default async function AppearanceSettingsPage() {
  const s = await getAllSettings();
  return (
    <div>
      <SettingsForm
        title="Colors & hero"
        description="Pick colors with the color wheel or type a hex code. Optional gradient for the hero background."
        initial={{
          "homepage.heroTitle": s["homepage.heroTitle"] ?? "",
          "homepage.heroHighlight": s["homepage.heroHighlight"] ?? "",
          "homepage.heroSubtitle": s["homepage.heroSubtitle"] ?? "",
          "homepage.heroSearchPlaceholder": s["homepage.heroSearchPlaceholder"] ?? "",
          "homepage.heroImageUrl": s["homepage.heroImageUrl"] ?? "",
          "homepage.heroBgColor": s["homepage.heroBgColor"] ?? "#0f172a",
          "homepage.heroGradient":
            s["homepage.heroGradient"] ?? "#0f172a|#059669|135",
          "homepage.heroUseGradient": s["homepage.heroUseGradient"] ?? false,
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
          {
            key: "homepage.heroHighlight",
            label: "Hero highlight text (optional emphasis)",
          },
          { key: "homepage.heroSubtitle", label: "Hero subtitle", type: "textarea" },
          {
            key: "homepage.heroSearchPlaceholder",
            label: "Search box placeholder",
          },
          {
            key: "homepage.heroImageUrl",
            label: "Hero background image URL",
            type: "url",
            help: "Optional image on top of solid color or gradient.",
          },
          {
            key: "homepage.heroUseGradient",
            label: "Use gradient for hero background (instead of solid color)",
            type: "checkbox",
          },
          {
            key: "homepage.heroBgColor",
            label: "Hero solid background color",
            type: "color",
            help: "Used when gradient is off.",
          },
          {
            key: "homepage.heroGradient",
            label: "Hero gradient",
            type: "gradient",
            help: "From / To colors + angle. Used when “Use gradient” is checked.",
          },
          {
            key: "homepage.heroOverlay",
            label: "Hero dark overlay strength",
            help: "0 to 1 (e.g. 0.55)",
          },
          {
            key: "homepage.primaryColor",
            label: "Primary brand color",
            type: "color",
          },
          {
            key: "homepage.accentColor",
            label: "Accent color",
            type: "color",
          },
          {
            key: "homepage.buttonColor",
            label: "Hero button background",
            type: "color",
          },
          {
            key: "homepage.buttonTextColor",
            label: "Hero button text color",
            type: "color",
          },
          { key: "homepage.heroCtaText", label: "Hero search button label" },
          { key: "homepage.heroCtaLink", label: "Hero CTA link (if not search)" },
        ]}
      />
    </div>
  );
}
