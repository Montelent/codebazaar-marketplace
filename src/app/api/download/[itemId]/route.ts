import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { getOverrides } from "@/lib/product-store";

async function buyerOwnsItem(
  itemId: string,
  email?: string | null,
  sessionUserId?: string | null
): Promise<boolean> {
  const buyerIds: string[] = [];
  if (sessionUserId && sessionUserId !== "admin-env") buyerIds.push(sessionUserId);
  if (email) {
    const { rows } = await query<{ id: string }>(
      `SELECT id FROM "User" WHERE lower(email) = lower($1)`,
      [email.trim().toLowerCase()]
    );
    buyerIds.push(...rows.map((r) => r.id));
  }
  const ids = [...new Set(buyerIds)];
  if (!ids.length) return false;

  const placeholders = ids.map((_, i) => `$${i + 2}`).join(", ");
  const row = await queryOne<{ n: string }>(
    `
    SELECT COUNT(*)::text AS n
    FROM "Order" o
    JOIN "OrderItem" oi ON oi."orderId" = o.id
    WHERE oi."itemId" = $1
      AND o.status = 'PAID'
      AND o."buyerId" IN (${placeholders})
    `,
    [itemId, ...ids]
  );
  return Number(row?.n || 0) > 0;
}

function asHttpUrl(raw: unknown): string | null {
  if (raw == null) return null;
  let s = typeof raw === "string" ? raw : String(raw);
  s = s.trim().replace(/^"|"$/g, "");
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return null;
}

async function resolveMainFileUrl(itemId: string): Promise<{
  url: string | null;
  title: string;
  slug: string;
}> {
  const overrides = await getOverrides();
  const fromOverride =
    overrides[itemId] ||
    Object.values(overrides).find((o) => o && (o.id === itemId || String(o.id) === itemId));

  let title = "product";
  let slug = itemId;
  let url: string | null = asHttpUrl(fromOverride?.mainFileUrl);

  if (fromOverride?.title) title = fromOverride.title;
  if (fromOverride?.slug) slug = fromOverride.slug;

  try {
    const item = await queryOne<{
      id: string;
      slug: string;
      title: string;
    }>(
      `SELECT id, slug, title FROM "Item" WHERE id = $1 OR slug = $1 LIMIT 1`,
      [itemId]
    );
    if (item) {
      title = item.title || title;
      slug = item.slug || slug;

      if (!url) {
        try {
          const withFile = await queryOne<{ mainFileUrl: string | null }>(
            `SELECT "mainFileUrl" FROM "Item" WHERE id = $1 LIMIT 1`,
            [item.id]
          );
          url = asHttpUrl(withFile?.mainFileUrl);
        } catch {
          /* column may not exist yet */
        }
      }

      if (!url && item.slug) {
        url = asHttpUrl(overrides[item.slug]?.mainFileUrl);
      }
    }
  } catch {
    /* ignore */
  }

  if (!url) {
    for (const key of [`product.mainFile.${itemId}`, `product.mainFile.${slug}`]) {
      try {
        const row = await queryOne<{ value: unknown }>(
          `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
          [key]
        );
        url = asHttpUrl(row?.value);
        if (url) break;
      } catch {
        /* ignore */
      }
    }
  }

  return { url, title, slug };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await context.params;
    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const emailParam = url.searchParams.get("email")?.trim().toLowerCase();
    const email = session?.user?.email || emailParam || null;
    const sessionId = (session?.user as { id?: string } | undefined)?.id || null;

    const owns = await buyerOwnsItem(itemId, email, sessionId);
    if (!owns) {
      const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Purchase required. Complete a paid order first." },
          { status: 403 }
        );
      }
    }

    const { url: fileUrl, title, slug } = await resolveMainFileUrl(itemId);

    if (fileUrl) {
      return NextResponse.redirect(fileUrl, 302);
    }

    return NextResponse.json(
      {
        error:
          "No download file URL is set for this product. Open Admin → Products → Edit and set “Main download file URL” (e.g. a .zip link), then Save.",
        itemId,
        title,
        slug,
      },
      { status: 404 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Download failed" },
      { status: 500 }
    );
  }
}
