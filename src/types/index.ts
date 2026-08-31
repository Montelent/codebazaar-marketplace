export type LicenseType = "REGULAR" | "EXTENDED";

export interface CartItem {
  itemId: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  licenseType: LicenseType;
  price: number;
  originalPrice?: number;
  authorUsername: string;
}

export interface ItemCardData {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  regularPrice: number | string;
  extendedPrice: number | string;
  salePriceRegular?: number | string | null;
  salePriceExtended?: number | string | null;
  ratingAvg: number;
  ratingCount: number;
  salesCount: number;
  author: {
    username: string;
    avatarUrl?: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
}

export interface CategoryNav {
  id: string;
  name: string;
  slug: string;
  children?: { id: string; name: string; slug: string }[];
}

export type SortOption =
  | "relevance"
  | "newest"
  | "bestselling"
  | "price_asc"
  | "price_desc"
  | "rating";
