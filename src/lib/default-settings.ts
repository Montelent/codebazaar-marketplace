export type SiteSettingsMap = Record<string, unknown>;

export const DEFAULT_SETTINGS: SiteSettingsMap = {
  "general.siteName": "CodeBazaar",
  "general.tagline": "Digital marketplace for code & creatives",
  "general.supportEmail": "support@codebazaar.com",
  "general.currency": "USD",
  "general.logoUrl": "",
  "general.faviconUrl": "",
  "header.showBecomeSeller": false,
  "header.announcement": "",
  "header.announcementEnabled": false,
  "footer.aboutText":
    "The marketplace for high-quality code, scripts, plugins, and digital assets.",
  "footer.copyright": "© CodeBazaar. All prices in USD.",
  "footer.social": { twitter: "", github: "", linkedin: "" },
  "homepage.heroTitle": "Code that powers your next product",
  "homepage.heroHighlight": "your next product",
  "homepage.heroSubtitle":
    "Discover premium scripts, themes, plugins, and templates from world-class independent creators.",
  "homepage.heroCtaText": "Search",
  "homepage.heroCtaLink": "/search",
  "homepage.showCategories": true,
  "homepage.showFeatured": true,
  "homepage.showBestsellers": true,
  "homepage.showTrustBlocks": true,
  "homepage.categories": [
    {
      name: "WordPress",
      slug: "wordpress",
      description: "Themes, plugins & WooCommerce",
      icon: "🟦",
    },
    {
      name: "PHP Scripts",
      slug: "php-scripts",
      description: "Laravel, CodeIgniter & scripts",
      icon: "🐘",
    },
    {
      name: "Mobile",
      slug: "mobile",
      description: "React Native, Flutter & apps",
      icon: "📱",
    },
    {
      name: "HTML5",
      slug: "html5",
      description: "Landing pages & admin templates",
      icon: "🌐",
    },
    {
      name: "JavaScript",
      slug: "javascript",
      description: "React, Vue, Node & kits",
      icon: "⚡",
    },
    {
      name: "Plugins",
      slug: "plugins",
      description: "Browser, IDE & design plugins",
      icon: "🔌",
    },
  ],
  "homepage.showBlog": true,
  "homepage.blogTitle": "From the blog",
  "homepage.blogLimit": 3,
  "homepage.statsSold": 128450,
  "homepage.statsEarnings": 4250000,
  "seo.defaultTitle": "CodeBazaar — Digital Marketplace for Code & Creatives",
  "seo.titleTemplate": "%s | CodeBazaar",
  "seo.defaultDescription":
    "Buy and sell high-quality scripts, plugins, themes, and digital assets.",
  "seo.ogImage": "",
  "seo.twitterHandle": "",
  "seo.robotsIndex": true,
  "seo.googleAnalyticsId": "",
  "seo.googleSearchConsole": "",
  "licenses.pageTitle": "License Types",
  "licenses.intro":
    "Every product on CodeBazaar is sold under two license tiers — Regular and Extended — similar to Envato / CodeCanyon.",
  "licenses.regular.title": "Regular License",
  "licenses.regular.blurb":
    "For a single end product (free or paid end users).",
  "licenses.regular.body":
    "Use the item to create one end product (website, app, or template) for yourself or one client. The end product can be distributed for free. You may charge clients for your services, but you cannot resell the item as a standalone product.",
  "licenses.extended.title": "Extended License",
  "licenses.extended.blurb":
    "For one end product sold to end users (SaaS, paid app).",
  "licenses.extended.body":
    "Use the item in one end product that may be sold to end users (for example a paid SaaS, theme, or application). Still limited to a single end product per license purchase.",
  "licenses.comparison": [
    { feature: "Number of end products", regular: "1", extended: "1" },
    { feature: "Use in a free end product", regular: "Yes", extended: "Yes" },
    {
      feature: "Use in a paid / commercial end product",
      regular: "Yes (single product)",
      extended: "Yes (including SaaS)",
    },
    {
      feature: "Charge end users for the product",
      regular: "No",
      extended: "Yes",
    },
    {
      feature: "Resell the item itself as stock",
      regular: "No",
      extended: "No",
    },
    { feature: "Support included", regular: "6 months", extended: "6 months" },
  ],
  "licenses.footerNote":
    "Buying a license does not transfer copyright. Authors retain ownership of their work.",
};
