import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Schema markup · Admin" };

export default async function SchemaSettingsPage() {
  const s = await getAllSettings();
  return (
    <SettingsForm
      title="Structured data (Schema.org)"
      description="JSON-LD types emitted on storefront pages for rich results"
      initial={{
        "schema.enableOrganization": s["schema.enableOrganization"] ?? true,
        "schema.enableWebSite": s["schema.enableWebSite"] ?? true,
        "schema.enableProduct": s["schema.enableProduct"] ?? true,
        "schema.enableBreadcrumb": s["schema.enableBreadcrumb"] ?? true,
        "schema.enableArticle": s["schema.enableArticle"] ?? true,
        "schema.enableFAQ": s["schema.enableFAQ"] ?? false,
        "schema.enableSoftwareApplication": s["schema.enableSoftwareApplication"] ?? true,
        "schema.enableOffer": s["schema.enableOffer"] ?? true,
        "schema.enableAggregateRating": s["schema.enableAggregateRating"] ?? true,
        "schema.enablePersonAuthor": s["schema.enablePersonAuthor"] ?? true,
        "schema.priceCurrency": s["schema.priceCurrency"] ?? "USD",
        "schema.brandName": s["schema.brandName"] ?? "CodeBazaar",
        "schema.defaultAvailability": s["schema.defaultAvailability"] ?? "https://schema.org/InStock",
        "schema.customJsonLd": s["schema.customJsonLd"] ?? "",
      }}
      fields={[
        { key: "schema.enableOrganization", label: "Organization schema", type: "checkbox" },
        { key: "schema.enableWebSite", label: "WebSite + SearchAction schema", type: "checkbox" },
        { key: "schema.enableProduct", label: "Product schema on item pages", type: "checkbox" },
        { key: "schema.enableSoftwareApplication", label: "SoftwareApplication schema on items", type: "checkbox" },
        { key: "schema.enableOffer", label: "Offer / price schema", type: "checkbox" },
        { key: "schema.enableAggregateRating", label: "AggregateRating schema", type: "checkbox" },
        { key: "schema.enableBreadcrumb", label: "BreadcrumbList schema", type: "checkbox" },
        { key: "schema.enableArticle", label: "Article schema on blog posts", type: "checkbox" },
        { key: "schema.enableFAQ", label: "FAQPage schema (when FAQ blocks present)", type: "checkbox" },
        { key: "schema.enablePersonAuthor", label: "Person schema for authors", type: "checkbox" },
        { key: "schema.priceCurrency", label: "Default price currency", help: "USD, EUR, …" },
        { key: "schema.brandName", label: "Brand name on Product schema" },
        { key: "schema.defaultAvailability", label: "Default Offer availability URL" },
        { key: "schema.customJsonLd", label: "Custom global JSON-LD (advanced)", type: "textarea", help: "Raw JSON object/array injected site-wide" },
      ]}
    />
  );
}
