import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "SEO · Admin" };

export default async function SeoSettingsPage() {
  const s = await getAllSettings();
  return (
    <SettingsForm
      title="SEO"
      description="Default meta tags, indexing, and analytics"
      initial={{
        "seo.defaultTitle": s["seo.defaultTitle"],
        "seo.titleTemplate": s["seo.titleTemplate"],
        "seo.defaultDescription": s["seo.defaultDescription"],
        "seo.ogImage": s["seo.ogImage"],
        "seo.twitterHandle": s["seo.twitterHandle"],
        "seo.robotsIndex": s["seo.robotsIndex"],
        "seo.googleAnalyticsId": s["seo.googleAnalyticsId"],
        "seo.googleSearchConsole": s["seo.googleSearchConsole"],
      }}
      fields={[
        { key: "seo.defaultTitle", label: "Default page title" },
        { key: "seo.titleTemplate", label: "Title template", help: "Use %s for page title" },
        { key: "seo.defaultDescription", label: "Default meta description", type: "textarea" },
        { key: "seo.ogImage", label: "Default Open Graph image URL", type: "url" },
        { key: "seo.twitterHandle", label: "Twitter handle", help: "@username" },
        { key: "seo.robotsIndex", label: "Allow search engines to index", type: "checkbox" },
        { key: "seo.googleAnalyticsId", label: "Google Analytics ID", help: "G-XXXXXXXX" },
        { key: "seo.googleSearchConsole", label: "Search Console verification meta content" },
      ]}
    />
  );
}
