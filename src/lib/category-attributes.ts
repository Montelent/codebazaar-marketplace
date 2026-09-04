/**
 * Default attribute definitions per marketplace category,
 * modeled after CodeCanyon item attributes (Compatible Browsers,
 * Software Version, Files Included, Compatible With, etc.).
 */
export type AttrMap = Record<string, string[]>;
export type AttrsByCategory = Record<string, AttrMap>;

export const DEFAULT_ATTRS_BY_CATEGORY: AttrsByCategory = {
  wordpress: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Opera", "Edge", "IE11"],
    "Software Version": [
      "WordPress 7.0.x",
      "WordPress 6.9.x",
      "WordPress 6.8.x",
      "WordPress 6.7.x",
      "WordPress 6.6.x",
      "WordPress 6.5.x",
      "WordPress 6.4.x",
      "WordPress 6.0.x",
      "WordPress 5.9.x",
    ],
    "Compatible With": [
      "Elementor",
      "Elementor Pro",
      "WooCommerce 10.x.x",
      "WooCommerce 9.x.x",
      "WPBakery Page Builder",
      "Block Editor",
      "Gutenberg",
      "WPML",
      "BuddyPress",
      "bbPress",
    ],
    "Files Included": [
      "JavaScript JS",
      "CSS",
      "PHP",
      "HTML",
      "Sass",
      "JavaScript JSON",
    ],
    "Gutenberg Optimized": ["Yes", "No"],
    "Widget Ready": ["Yes", "No"],
    "High Resolution": ["Yes", "No"],
  },
  "php-scripts": {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Opera", "Edge"],
    "Software Framework": [
      "Laravel",
      "CodeIgniter",
      "Core PHP",
      "Symfony",
      "Yii",
      "Other",
    ],
    "Software Version": [
      "PHP 8.x",
      "PHP 7.x",
      "MySQL 8.x",
      "MySQL 5.x",
      "PostgreSQL",
      "Other",
    ],
    "Files Included": [
      "PHP",
      "JavaScript JS",
      "CSS",
      "HTML",
      "SQL",
      "Sass",
    ],
    "High Resolution": ["Yes", "No"],
  },
  javascript: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Opera", "Edge"],
    "Software Framework": [
      "React",
      "Vue",
      "Angular",
      "Next.js",
      "Node.js",
      "Svelte",
      "jQuery",
      "Other",
    ],
    "Software Version": [
      "React 19.x",
      "React 18.x",
      "Node 22.x",
      "Node 20.x",
      "Vue 3.x",
      "Other",
    ],
    "Files Included": [
      "JavaScript JS",
      "TypeScript",
      "CSS",
      "SCSS",
      "HTML",
      "JSON",
    ],
    "High Resolution": ["Yes", "No"],
  },
  html5: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Opera", "Edge"],
    "Files Included": ["HTML", "CSS", "JavaScript JS", "PSD", "Sketch", "Figma"],
    "High Resolution": ["Yes", "No"],
    "Columns": ["1", "2", "3", "4", "4+"],
    "Layout": ["Responsive", "Fixed"],
  },
  mobile: {
    "Software Framework": [
      "Flutter",
      "React Native",
      "Swift",
      "Kotlin",
      "Ionic",
      "Other",
    ],
    "Software Version": [
      "Flutter 3.x",
      "React Native 0.7x",
      "iOS 15+",
      "Android 12+",
      "Other",
    ],
    "Files Included": ["Dart", "JavaScript JS", "TypeScript", "Java", "Swift"],
  },
  plugins: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Opera", "Edge"],
    "Software Framework": ["WordPress", "Figma", "VS Code", "Browser", "Other"],
    "Files Included": ["JavaScript JS", "CSS", "PHP", "HTML"],
    "High Resolution": ["Yes", "No"],
  },
  "ai-tools": {
    "Software Framework": ["Next.js", "Python", "Node.js", "Laravel", "Other"],
    "Software Version": ["Python 3.x", "Node 20.x", "PHP 8.x", "Other"],
    "Files Included": ["TypeScript", "Python", "JSON", "PHP", "JavaScript JS"],
  },
  ecommerce: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Opera", "Edge"],
    "Software Framework": [
      "WooCommerce",
      "Laravel",
      "Shopify",
      "Next.js",
      "Magento",
      "Other",
    ],
    "Software Version": ["PHP 8.x", "WooCommerce 9.x", "WooCommerce 10.x", "Other"],
    "Files Included": ["PHP", "JavaScript JS", "CSS", "SQL", "HTML"],
    "High Resolution": ["Yes", "No"],
  },
  cms: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Opera", "Edge"],
    "Software Framework": ["Laravel", "WordPress", "Custom", "Other"],
    "Software Version": ["PHP 8.x", "PHP 7.x", "Other"],
    "Files Included": ["PHP", "JavaScript JS", "CSS", "SQL"],
  },
  "ui-kits": {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Opera", "Edge"],
    "Software Framework": ["React", "Vue", "HTML", "Figma", "Other"],
    "Files Included": ["JavaScript JS", "TypeScript", "CSS", "SCSS", "HTML"],
    "High Resolution": ["Yes", "No"],
  },
};

export function mergeCategoryAttrs(
  stored: AttrsByCategory | undefined,
  categorySlug: string
): AttrMap {
  const defaults = DEFAULT_ATTRS_BY_CATEGORY[categorySlug] || {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge"],
    "Files Included": ["JavaScript JS", "CSS", "HTML"],
  };
  const custom = stored?.[categorySlug];
  if (custom && typeof custom === "object" && Object.keys(custom).length) {
    return { ...defaults, ...custom };
  }
  return defaults;
}
