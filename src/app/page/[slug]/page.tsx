import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getPage(slug: string) {
  try {
    const row = await queryOne<{
      title: string;
      slug: string;
      content: string;
      status: string;
    }>(
      `SELECT title, slug, content, status FROM "CmsPage" WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    return row;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page" };
  return { title: page.title };
}

export default async function CmsPublicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  const fallbacks: Record<string, { title: string; html: string }> = {
    terms: {
      title: "Terms of Use",
      html: "<p>These Terms of Use govern your use of this marketplace. By purchasing or downloading items you agree to the license terms selected at checkout.</p>",
    },
    privacy: {
      title: "Privacy Policy",
      html: "<p>We collect account and order information needed to deliver digital products. Contact us to request data deletion.</p>",
    },
    about: {
      title: "About",
      html: "<p>We are a digital marketplace for high-quality code, scripts, and plugins.</p>",
    },
    help: {
      title: "Help Center",
      html: "<p>Need help with a purchase or download? Contact support from your account dashboard or email the site administrator.</p>",
    },
    contact: {
      title: "Contact",
      html: "<p>Reach us via the email address listed in site settings, or open a support ticket from your account.</p>",
    },
  };

  const data =
    page && (page.status === "PUBLISHED" || page.status === "DRAFT")
      ? { title: page.title, html: page.content || "" }
      : fallbacks[slug];

  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
      <article
        className="prose prose-slate mt-6 max-w-none"
        dangerouslySetInnerHTML={{ __html: data.html }}
      />
    </div>
  );
}
