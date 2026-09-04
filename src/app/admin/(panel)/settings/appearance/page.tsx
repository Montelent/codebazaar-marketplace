import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appearance · Admin" };

export default async function AppearanceSettingsPage() {
  const s = await getAllSettings();
  return (
    <div>
      <SettingsForm
        title="Colors & hero background"
        description="Brand colors and hero background only. Edit hero title/subtitle under Settings → Homepage (not here) to avoid duplicates."
        initial={{
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
        }}
        fields={[
          {
            key: "homepage.heroImageUrl",
            label: "Hero background image URL",
            type: "url",
            help: "Optional image over solid color or gradient.",
          },
          {
            key: "homepage.heroUseGradient",
            label: "Use gradient for hero background",
            type: "checkbox",
          },
          {
            key: "homepage.heroBgColor",
            label: "Hero solid background color",
            type: "color",
          },
          {
            key: "homepage.heroGradient",
            label: "Hero gradient (from | to | angle)",
            type: "gradient",
            help: "Used when “Use gradient” is checked.",
          },
          {
            key: "homepage.heroOverlay",
            label: "Hero dark overlay strength (0–1)",
            help: "e.g. 0.55",
          },
          {
            key: "homepage.primaryColor",
            label: "Primary brand color",
            type: "color",
          },
          {
            key: "homepage.accentColor",
            label: "Accent color (highlight text)",
            type: "color",
          },
          {
            key: "homepage.buttonColor",
            label: "Primary button color",
            type: "color",
          },
          {
            key: "homepage.buttonTextColor",
            label: "Primary button text color",
            type: "color",
          },
        ]}
      />
    </div>
  );
}
