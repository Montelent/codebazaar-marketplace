import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Header & Footer · Admin" };

export default async function HeaderFooterSettingsPage() {
  const s = await getAllSettings();
  return (
    <SettingsForm
      title="Header & Footer"
      description="Announcement bar, footer about text, social links"
      initial={{
        "header.announcementEnabled": s["header.announcementEnabled"],
        "header.announcement": s["header.announcement"],
        "footer.aboutText": s["footer.aboutText"],
        "footer.copyright": s["footer.copyright"],
        "footer.social.twitter": (s["footer.social"] as { twitter?: string })?.twitter ?? "",
        "footer.social.github": (s["footer.social"] as { github?: string })?.github ?? "",
        "footer.social.linkedin": (s["footer.social"] as { linkedin?: string })?.linkedin ?? "",
      }}
      fields={[
        { key: "header.announcementEnabled", label: "Show announcement bar", type: "checkbox" },
        { key: "header.announcement", label: "Announcement text", type: "textarea" },
        { key: "footer.aboutText", label: "Footer about text", type: "textarea" },
        { key: "footer.copyright", label: "Copyright line" },
        { key: "footer.social.twitter", label: "Twitter / X URL", type: "url" },
        { key: "footer.social.github", label: "GitHub URL", type: "url" },
        { key: "footer.social.linkedin", label: "LinkedIn URL", type: "url" },
      ]}
    />
  );
}
