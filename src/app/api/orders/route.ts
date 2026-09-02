import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

type IncomingItem = {
  itemId: string;
  slug?: string;
  title?: string;
  thumbnailUrl?: string;
  licenseType?: string;
  price?: number;
};

async function resolveBuyerId(email: string, name?: string, sessionUserId?: string) {
  if (sessionUserId && sessionUserId !== "admin-env") {
    return sessionUserId;
  }
  const normalized = email.trim().toLowerCase();
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM "User" WHERE lower(email) = lower($1) LIMIT 1`,
    [normalized]
  );
  if (existing?.id) return existing.id;

  const usernameBase =
    normalized.split("@")[0].replace(/[^a-z0-9_]/gi, "").slice(0, 20) || "buyer";
  const username = `${usernameBase}_${Date.now().toString(36).slice(-4)}`;
  const row = await queryOne<{ id: string }>(
    `
    INSERT INTO "User" ("id", "email", "username", "name", "role", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, $1, $2, $3, 'BUYER', NOW(), NOW())
    RETURNING id
    `,
    [normalized, username, name?.trim() || usernameBase]
  );
  return row!.id;
}

async function resolveItem(
  itemId: string,
  slug?: string,
  title?: string,
  price?: number,
  thumbnailUrl?: string
) {
  const byId = await queryOne<{ id: string; slug: string; title: string; thumbnailUrl: string }>(
    `SELECT id, slug, title, "thumbnailUrl" FROM "Item" WHERE id = $1 LIMIT 1`,
    [itemId]
  );
  if (byId) return byId;

  if (slug) {
    const bySlug = await queryOne<{ id: string; slug: string; title: string; thumbnailUrl: string }>(
      `SELECT id, slug, title, "thumbnailUrl" FROM "Item" WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (bySlug) return bySlug;
  }

  if (!slug || !title) return null;

  const admin = await queryOne<{ id: string }>(`SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1`);
  const cat = await queryOne<{ id: string }>(`SELECT id FROM "Category" LIMIT 1`);
  if (!admin || !cat) return null;

  await query(
    `
    INSERT INTO "Item" (
      "id", "title", "slug", "description", "features", "tags",
      "regularPrice", "extendedPrice", "thumbnailUrl", "status", "isFeatured",
      "authorId", "categoryId", "createdAt", "updatedAt"
    )
    SELECT gen_random_uuid()::text, $1, $2, $3, '[]'::jsonb, '[]'::jsonb,
           $4, $4, $5, 'APPROVED', false, $6, $7, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM "Item" WHERE slug = $2)
    `,
    [
      title,
      slug,
      title,
      Number(price) || 0,
      thumbnailUrl || "https://picsum.photos/seed/item/640/400",
      admin.id,
      cat.id,
    ]
  );

  return queryOne<{ id: string; slug: string; title: string; thumbnailUrl: string }>(
    `SELECT id, slug, title, "thumbnailUrl" FROM "Item" WHERE slug = $1 LIMIT 1`,
    [slug]
  );
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const email = String(body.email || session?.user?.email || "").trim().toLowerCase();
    const name = String(body.name || session?.user?.name || "");
    const items = (body.items || []) as IncomingItem[];
    const total = Number(body.total ?? 0);
    const method = String(body.method || "free");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!items.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const buyerId = await resolveBuyerId(
      email,
      name,
      (session?.user as { id?: string } | undefined)?.id
    );

    const resolved = [];
    for (const it of items) {
      const dbItem = await resolveItem(
        String(it.itemId),
        it.slug,
        it.title,
        it.price,
        it.thumbnailUrl
      );
      if (!dbItem) continue;
      resolved.push({
        itemId: dbItem.id,
        licenseType: it.licenseType === "EXTENDED" ? "EXTENDED" : "REGULAR",
        price: Number(it.price) || 0,
        slug: dbItem.slug,
        title: dbItem.title,
        thumbnailUrl: dbItem.thumbnailUrl,
      });
    }

    if (!resolved.length) {
      return NextResponse.json({ error: "Could not resolve products" }, { status: 400 });
    }

    const status = method === "manual" ? "PENDING" : "PAID";
    const order = await queryOne<{ id: string }>(
      `
      INSERT INTO "Order" ("id", "buyerId", "total", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3::"OrderStatus", NOW(), NOW())
      RETURNING id
      `,
      [buyerId, total, status]
    );

    for (const it of resolved) {
      await query(
        `
        INSERT INTO "OrderItem" ("id", "orderId", "itemId", "licenseType", "price")
        VALUES (gen_random_uuid()::text, $1, $2, $3::"LicenseType", $4)
        `,
        [order!.id, it.itemId, it.licenseType, it.price]
      );
    }

    return NextResponse.json({
      ok: true,
      permanent: true,
      orderId: order!.id,
      buyerId,
      status,
      items: resolved,
      message: "Order saved to Postgres",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    console.error("Order POST:", message);
    return NextResponse.json({ error: message, permanent: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const emailParam = url.searchParams.get("email")?.trim().toLowerCase();
    const email = (session?.user?.email || emailParam || "").toLowerCase();
    const sessionId = (session?.user as { id?: string } | undefined)?.id;

    if (!email && !sessionId) {
      return NextResponse.json(
        { error: "Sign in or provide email", items: [] },
        { status: 401 }
      );
    }

    let buyerIds: string[] = [];
    if (sessionId && sessionId !== "admin-env") buyerIds.push(sessionId);
    if (email) {
      const { rows } = await query<{ id: string }>(
        `SELECT id FROM "User" WHERE lower(email) = lower($1)`,
        [email]
      );
      buyerIds.push(...rows.map((u) => u.id));
    }
    buyerIds = [...new Set(buyerIds)];
    if (!buyerIds.length) return NextResponse.json({ items: [], source: "db" });

    const placeholders = buyerIds.map((_, i) => `$${i + 1}`).join(", ");
    const { rows } = await query(
      `
      SELECT
        o.id AS "orderId",
        o.status::text AS "orderStatus",
        o."createdAt" AS "purchasedAt",
        oi."itemId" AS "itemId",
        oi."licenseType"::text AS "licenseType",
        oi.price AS price,
        i.slug,
        i.title,
        i."thumbnailUrl" AS "thumbnailUrl"
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId" = o.id
      JOIN "Item" i ON i.id = oi."itemId"
      WHERE o."buyerId" IN (${placeholders})
        AND o.status IN ('PAID', 'PENDING')
      ORDER BY o."createdAt" DESC
      `,
      buyerIds
    );

    const items = rows.map((r) => ({
      id: `${r.orderId}-${r.itemId}-${r.licenseType}`,
      orderId: r.orderId,
      itemId: r.itemId,
      slug: r.slug,
      title: r.title,
      thumbnailUrl: r.thumbnailUrl,
      licenseType: r.licenseType,
      price: Number(r.price),
      status: r.orderStatus,
      purchasedAt: new Date(r.purchasedAt as string).toISOString(),
      downloadUrl: `/api/download/${r.itemId}`,
    }));

    return NextResponse.json({ items, source: "db", permanent: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    console.error("Order GET:", message);
    return NextResponse.json({ error: message, items: [] }, { status: 500 });
  }
}
