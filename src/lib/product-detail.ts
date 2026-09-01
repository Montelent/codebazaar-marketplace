/** Full product detail shape used on the CodeCanyon-style item page */

export type ProductAttribute = {
  label: string;
  value: string;
};

export type ChangelogEntry = {
  version: string;
  date?: string;
  items: string[];
};

export type ProductDetail = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  previewUrl?: string;
  demoUrl?: string;
  regularPrice: number;
  extendedPrice: number;
  salePriceRegular?: number | null;
  salePriceExtended?: number | null;
  ratingAvg: number;
  ratingCount: number;
  salesCount: number;
  version: string;
  descriptionHtml: string;
  features: string[];
  requirements: string[];
  changelogs: ChangelogEntry[];
  licenseFeatures: string[];
  attributes: ProductAttribute[];
  tags: string[];
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    isElite?: boolean;
    badges?: string[];
  };
  category: {
    name: string;
    slug: string;
    parentName?: string;
    parentSlug?: string;
  };
  lastUpdate: string;
  createdAt: string;
};

const PLACEHOLDER = (seed: number) =>
  `https://picsum.photos/seed/cb${seed}/960/540`;

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  "1": {
    id: "1",
    slug: "react-dashboard-pro",
    title: "React Admin Dashboard Pro — Modern Analytics UI Kit",
    thumbnailUrl: PLACEHOLDER(1),
    galleryUrls: [PLACEHOLDER(1), PLACEHOLDER(11), PLACEHOLDER(12)],
    previewUrl: "https://example.com/demo/react-dashboard-pro",
    demoUrl: "https://example.com/demo/react-dashboard-pro",
    regularPrice: 49,
    extendedPrice: 249,
    salePriceRegular: 29,
    salePriceExtended: 199,
    ratingAvg: 4.8,
    ratingCount: 312,
    salesCount: 4850,
    version: "1.2.0",
    descriptionHtml: `
<p><strong>Note:</strong> This is a production-ready React admin kit. Purchase unlocks source files, docs, and updates.</p>
<p>Build polished analytics dashboards in minutes. Includes 40+ pages, dark mode, chart widgets, and TypeScript support.</p>
`,
    features: [
      "40+ ready-made dashboard pages",
      "Dark & light themes",
      "TypeScript + Next.js friendly",
      "Chart, table, and form kits",
      "Responsive mobile layout",
    ],
    requirements: ["Node.js 18+", "React 18+", "npm or pnpm"],
    changelogs: [
      { version: "1.2.0", items: ["[UPDATED] Chart kit performance", "New KPI cards"] },
      { version: "1.1.0", items: ["Dark mode refinements", "Auth layout fixes"] },
      { version: "1.0.0", items: ["Initial release"] },
    ],
    licenseFeatures: [
      "Quality checked by CodeBazaar",
      "Future updates",
      "6 months support from author",
    ],
    attributes: [
      { label: "Last Update", value: "19 January 2025" },
      { label: "High Resolution", value: "Yes" },
      { label: "Compatible Browsers", value: "Chrome, Firefox, Safari, Edge" },
      { label: "Files Included", value: "JavaScript JS, CSS, TSX" },
      { label: "Software Framework", value: "React" },
      { label: "Software Version", value: "React 18.x" },
      { label: "Tags", value: "admin, dashboard, analytics, react, typescript" },
      { label: "Created", value: "1 year ago" },
    ],
    tags: ["admin", "dashboard", "react", "typescript", "analytics"],
    author: {
      username: "pixelcraft",
      displayName: "Pixelcraft",
      avatarUrl: null,
      isElite: true,
    },
    category: {
      name: "JavaScript",
      slug: "javascript",
      parentName: "Code",
      parentSlug: "code",
    },
    lastUpdate: "19 January 2025",
    createdAt: "1 year ago",
  },
};

/** Fallback when a mock card has no rich detail entry */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function detailFromCard(item: any): ProductDetail {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    thumbnailUrl: item.thumbnailUrl,
    galleryUrls: [item.thumbnailUrl],
    demoUrl: item.demoUrl,
    regularPrice: Number(item.regularPrice),
    extendedPrice: Number(item.extendedPrice),
    salePriceRegular: item.salePriceRegular != null ? Number(item.salePriceRegular) : null,
    salePriceExtended: item.salePriceExtended != null ? Number(item.salePriceExtended) : null,
    ratingAvg: item.ratingAvg,
    ratingCount: item.ratingCount,
    salesCount: item.salesCount,
    version: item.version || "1.0.0",
    descriptionHtml: `<p>${item.description || item.title}</p>`,
    features: Array.isArray(item.features) ? item.features : [],
    requirements: ["See documentation"],
    changelogs: [{ version: "1.0.0", items: ["Initial release"] }],
    licenseFeatures: [
      "Quality checked by CodeBazaar",
      "Future updates",
      "6 months support from author",
    ],
    attributes: [
      { label: "Last Update", value: "Recently" },
      { label: "Created", value: "—" },
      { label: "Tags", value: item.category?.name || "" },
    ],
    tags: [item.category?.slug || "code"],
    author: {
      username: item.author.username,
      displayName: item.author.username,
      avatarUrl: item.author.avatarUrl,
      isElite: true,
    },
    category: {
      name: item.category.name,
      slug: item.category.slug,
      parentName: "Code",
      parentSlug: "code",
    },
    lastUpdate: "Recently",
    createdAt: "—",
  };
}
