import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "SEO · Admin" };

export default async function SeoSettingsPage() {
  const s = await getAllSettings();
  return (
    <SettingsForm
      title="Technical SEO"
      description="Titles, meta, robots, sitemaps, analytics, verification, social cards"
      initial={{
        "seo.defaultTitle": s["seo.defaultTitle"] ?? "CodeBazaar",
        "seo.titleTemplate": s["seo.titleTemplate"] ?? "%s | CodeBazaar",
        "seo.defaultDescription": s["seo.defaultDescription"] ?? "",
        "seo.defaultKeywords": s["seo.defaultKeywords"] ?? "",
        "seo.canonicalBase": s["seo.canonicalBase"] ?? "https://codebazaar-marketplace.vercel.app",
        "seo.ogImage": s["seo.ogImage"] ?? "",
        "seo.ogType": s["seo.ogType"] ?? "website",
        "seo.twitterHandle": s["seo.twitterHandle"] ?? "",
        "seo.twitterCard": s["seo.twitterCard"] ?? "summary_large_image",
        "seo.robotsIndex": s["seo.robotsIndex"] ?? true,
        "seo.robotsFollow": s["seo.robotsFollow"] ?? true,
        "seo.robotsExtra": s["seo.robotsExtra"] ?? "max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        "seo.googleAnalyticsId": s["seo.googleAnalyticsId"] ?? "",
        "seo.googleTagManagerId": s["seo.googleTagManagerId"] ?? "",
        "seo.googleSearchConsole": s["seo.googleSearchConsole"] ?? "",
        "seo.bingWebmaster": s["seo.bingWebmaster"] ?? "",
        "seo.yandexVerification": s["seo.yandexVerification"] ?? "",
        "seo.facebookDomainVerification": s["seo.facebookDomainVerification"] ?? "",
        "seo.pinterestVerification": s["seo.pinterestVerification"] ?? "",
        "seo.sitemapEnabled": s["seo.sitemapEnabled"] ?? true,
        "seo.sitemapExtraUrls": s["seo.sitemapExtraUrls"] ?? "",
        "seo.hreflangDefault": s["seo.hreflangDefault"] ?? "en",
        "seo.organizationName": s["seo.organizationName"] ?? "CodeBazaar",
        "seo.organizationLogo": s["seo.organizationLogo"] ?? "",
        "seo.organizationSameAs": s["seo.organizationSameAs"] ?? "",
        "seo.headScripts": s["seo.headScripts"] ?? "",
        "seo.bodyScripts": s["seo.bodyScripts"] ?? "",
      }}
      fields={[
        { key: "seo.defaultTitle", label: "Default page title" },
        { key: "seo.titleTemplate", label: "Title template", help: "Use %s for the page title" },
        { key: "seo.defaultDescription", label: "Default meta description", type: "textarea" },
        { key: "seo.defaultKeywords", label: "Default keywords (comma-separated)" },
        { key: "seo.canonicalBase", label: "Canonical base URL", type: "url" },
        { key: "seo.ogImage", label: "Default Open Graph image URL", type: "url" },
        { key: "seo.ogType", label: "Default OG type", help: "website | product | article" },
        { key: "seo.twitterHandle", label: "Twitter / X handle", help: "@username" },
        { key: "seo.twitterCard", label: "Twitter card type", help: "summary_large_image | summary" },
        { key: "seo.robotsIndex", label: "Allow indexing (robots index)", type: "checkbox" },
        { key: "seo.robotsFollow", label: "Allow following links (robots follow)", type: "checkbox" },
        { key: "seo.robotsExtra", label: "Extra robots directives" },
        { key: "seo.googleAnalyticsId", label: "Google Analytics ID", help: "G-XXXXXXXX" },
        { key: "seo.googleTagManagerId", label: "Google Tag Manager ID", help: "GTM-XXXX" },
        { key: "seo.googleSearchConsole", label: "Google Search Console verification content" },
        { key: "seo.bingWebmaster", label: "Bing Webmaster verification" },
        { key: "seo.yandexVerification", label: "Yandex verification" },
        { key: "seo.facebookDomainVerification", label: "Facebook domain verification" },
        { key: "seo.pinterestVerification", label: "Pinterest verification" },
        { key: "seo.sitemapEnabled", label: "Enable XML sitemap generation", type: "checkbox" },
        { key: "seo.sitemapExtraUrls", label: "Extra sitemap URLs (one per line)", type: "textarea" },
        { key: "seo.hreflangDefault", label: "Default hreflang", help: "e.g. en, en-US" },
        { key: "seo.organizationName", label: "Organization name (JSON-LD)" },
        { key: "seo.organizationLogo", label: "Organization logo URL", type: "url" },
        { key: "seo.organizationSameAs", label: "Organization sameAs social URLs (comma-separated)" },
        { key: "seo.headScripts", label: "Custom head scripts / meta (advanced)", type: "textarea" },
        { key: "seo.bodyScripts", label: "Custom body scripts (advanced)", type: "textarea" },
      ]}
    />
  );
}
