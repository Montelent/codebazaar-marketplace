import { HomepageSettingsEditor } from "@/components/admin/homepage-settings-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Homepage · Admin" };

export default function HomepageSettingsPage() {
  return <HomepageSettingsEditor />;
}
