import { LicensesSettingsEditor } from "@/components/admin/licenses-settings-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Licenses · Admin" };

export default function AdminLicensesSettingsPage() {
  return <LicensesSettingsEditor />;
}
