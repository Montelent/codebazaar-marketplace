import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import Link from "next/link";

export const metadata = { title: "General settings · Admin" };

export default async function GeneralSettingsPage() {
  const s = await getAllSettings();
  return (
    <div className="space-y-4">
      <Link href="/admin/settings" className="text-sm text-emerald-600 hover:underline">
        ← All settings
      </Link>
      <SettingsForm
        title="General settings"
        description="Store identity, branding, and support contact"
        initial={{
          "general.siteName": s["general.siteName"] ?? "CodeBazaar",
          "general.tagline": s["general.tagline"] ?? "",
          "general.supportEmail": s["general.supportEmail"] ?? "",
          "general.currency": s["general.currency"] ?? "USD",
          "general.logoUrl": s["general.logoUrl"] ?? "",
          "general.faviconUrl": s["general.faviconUrl"] ?? "",
        }}
        fields={[
          { key: "general.siteName", label: "Site name" },
          { key: "general.tagline", label: "Tagline" },
          { key: "general.supportEmail", label: "Support email" },
          { key: "general.currency", label: "Currency code", help: "e.g. USD, EUR" },
          { key: "general.logoUrl", label: "Logo URL", type: "url" },
          { key: "general.faviconUrl", label: "Favicon URL", type: "url" },
        ]}
      />
    </div>
  );
}
