import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSetting, setSettings } from "@/lib/settings";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

const DEFAULT_TAGS = [
  "react", "nextjs", "wordpress", "php", "laravel", "typescript", "admin", "dashboard", "ecommerce",
];

const DEFAULT_ATTRS: Record<string, string[]> = {
  "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge", "Opera"],
  "High Resolution": ["Yes", "No"],
};

const DEFAULT_ATTRS_BY_CATEGORY: Record<string, Record<string, string[]>> = {
  wordpress: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge", "Opera"],
    "Software Version": ["WordPress 6.x", "WordPress 5.x"],
    "Files Included": ["CSS", "JS", "PHP", "HTML"],
    "High Resolution": ["Yes", "No"],
  },
  "php-scripts": {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge"],
    "Software Framework": ["Laravel", "CodeIgniter", "Core PHP", "Symfony"],
    "Software Version": ["PHP 8.x", "PHP 7.x"],
    "Files Included": ["PHP", "JavaScript JS", "CSS", "SQL"],
  },
  javascript: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge", "Opera"],
    "Software Framework": ["React", "Vue", "Angular", "Next.js", "Node.js"],
    "Software Version": ["React 18.x", "Node 20.x"],
    "Files Included": ["JavaScript JS", "TypeScript", "CSS", "SCSS", "JSON"],
  },
  html5: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge", "Opera"],
    "Files Included": ["HTML", "CSS", "JS", "PSD"],
    "High Resolution": ["Yes", "No"],
  },
  mobile: {
    "Software Framework": ["Flutter", "React Native", "Swift", "Kotlin"],
    "Software Version": ["Flutter 3.x", "React Native 0.7x"],
    "Files Included": ["Dart", "JavaScript JS", "TypeScript"],
  },
  plugins: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge"],
    "Software Framework": ["WordPress", "Figma", "VS Code"],
    "Files Included": ["JS", "CSS", "PHP"],
  },
  "ai-tools": {
    "Software Framework": ["Next.js", "Python", "Node.js"],
    "Files Included": ["TypeScript", "Python", "JSON"],
  },
  ecommerce: {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge"],
    "Software Framework": ["WooCommerce", "Laravel", "Shopify", "Next.js"],
    "Files Included": ["PHP", "JS", "CSS", "SQL"],
  },
};

const DEFAULT_BLOG_CATEGORIES = [
  { name: "News", slug: "news" },
  { name: "Tutorials", slug: "tutorials" },
  { name: "Product updates", slug: "product-updates" },
  { name: "Tips", slug: "tips" },
];

export async function GET(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const categorySlug = url.searchParams.get("category") || "";

  const tags = (await getSetting("taxonomy.tags")) as string[] | undefined;
  const attrs = (await getSetting("taxonomy.attributes")) as Record<string, string[]> | undefined;
  const byCat = (await getSetting("taxonomy.attributesByCategory")) as
    | Record<string, Record<string, string[]>>
    | undefined;
  const blogCats = (await getSetting("blog.categories")) as
    | { name: string; slug: string }[]
    | undefined;

  const catMap = {
    ...DEFAULT_ATTRS_BY_CATEGORY,
    ...(byCat && typeof byCat === "object" ? byCat : {}),
  };

  let attributes: Record<string, string[]> =
    attrs && typeof attrs === "object" && Object.keys(attrs).length
      ? attrs
      : DEFAULT_ATTRS;

  if (categorySlug && catMap[categorySlug]) {
    attributes = { ...DEFAULT_ATTRS, ...catMap[categorySlug] };
  }

  return NextResponse.json({
    tags: Array.isArray(tags) && tags.length ? tags : DEFAULT_TAGS,
    attributes,
    attributesByCategory: catMap,
    blogCategories:
      Array.isArray(blogCats) && blogCats.length ? blogCats : DEFAULT_BLOG_CATEGORIES,
  });
}

export async function PUT(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const payload: Record<string, unknown> = {};
    if (body.tags) payload["taxonomy.tags"] = body.tags;
    if (body.attributes) payload["taxonomy.attributes"] = body.attributes;
    if (body.attributesByCategory)
      payload["taxonomy.attributesByCategory"] = body.attributesByCategory;
    if (body.blogCategories) payload["blog.categories"] = body.blogCategories;
    await setSettings(payload);
    return NextResponse.json({ ok: true, permanent: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}
