import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const existing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT id FROM "User" WHERE lower(email) = lower($1) LIMIT 1`,
    normalized
  );
  if (existing[0]?.id) return existing[0].id;

  const usernameBase =
    normalized.split("@")[0].replace(/[^a-z0-9_]/gi, "").slice(0, 20) || "buyer";
  const username = `${usernameBase}_${Date.now().toString(36).slice(-4)}`;
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `
    INSERT INTO "User" ("id", "email", "username", "name", "role", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, $1, $2, $3, 'BUYER', NOW(), NOW())
    RETURNING id
    `,
    normalized,
    username,
    name?.trim() || usernameBase
  );
  return rows[0].id;
}

async function resolveItemId(itemId: string, slug?: string) {
  const byId = await prisma.$queryRawUnsafe<
    Array<{ id: string; slug: string; title: string; thumbnailUrl: string }>
  >(`SELECT id, slug, title, "thumbnailUrl" FROM "Item" WHERE id = $1 LIMIT 1`, itemId);
  if (byId[0]) return byId[0];

  if (slug) {
    const bySlug = await prisma.$queryRawUnsafe<
      Array<{ id: string; slug: string; title: string; thumbnailUrl: string }>
    >(`SELECT id, slug, title, "thumbnailUrl" FROM "Item" WHERE slug = $1 LIMIT 1`, slug);
    if (bySlug[0]) return bySlug[0];
  }
  return null;
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
      return NextResponse.json(
        { error: "Email is required so purchases sync across devices" },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const buyerId = await resolveBuyerId(
      email,
      name,
      (session?.user as { id?: string } | undefined)?.id
    );

    const resolved: Array<{
      itemId: string;
      licenseType: string;
      price: number;
      slug: string;
      title: string;
      thumbnailUrl: string;
    }> = [];

    for (const it of items) {
      const dbItem = await resolveItemId(String(it.itemId), it.slug);
      if (!dbItem) {
        if (!it.slug || !it.title) continue;
        const created = await prisma.$queryRawUnsafe<
          Array<{ id: string; slug: string; title: string; thumbnailUrl: string }>
        >(
          `
          INSERT INTO "Item" (
            "id", "title", "slug", "description", "features", "tags",
            "regularPrice", "extendedPrice", "thumbnailUrl", "status", "isFeatured",
            "authorId", "categoryId", "createdAt", "updatedAt"
          )
          SELECT
            gen_random_uuid()::text, $1, $2, $3, '[]'::jsonb, '[]'::jsonb,
            $4, $4, $5, 'APPROVED', false,
            (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1),
            (SELECT id FROM "Category" LIMIT 1),
            NOW(), NOW()
          WHERE NOT EXISTS (SELECT 1 FROM "Item" WHERE slug = $2)
          RETURNING id, slug, title, "thumbnailUrl"
          `,
          it.title,
          it.slug,
          it.title,
          Number(it.price) || 0,
          it.thumbnailUrl || "https://picsum.photos/seed/item/640/400"
        );
        const row =
          created[0] ||
          (
            await prisma.$queryRawUnsafe<
              Array<{ id: string; slug: string; title: string; thumbnailUrl: string }>
            >(`SELECT id, slug, title, "thumbnailUrl" FROM "Item" WHERE slug = $1 LIMIT 1`, it.slug)
          )[0];
        if (!row) continue;
        resolved.push({
          itemId: row.id,
          licenseType: it.licenseType === "EXTENDED" ? "EXTENDED" : "REGULAR",
          price: Number(it.price) || 0,
          slug: row.slug,
          title: row.title,
          thumbnailUrl: row.thumbnailUrl,
        });
      } else {
        resolved.push({
          itemId: dbItem.id,
          licenseType: it.licenseType === "EXTENDED" ? "EXTENDED" : "REGULAR",
          price: Number(it.price) || 0,
          slug: dbItem.slug,
          title: dbItem.title,
          thumbnailUrl: dbItem.thumbnailUrl,
        });
      }
    }

    if (resolved.length === 0) {
      return NextResponse.json(
        { error: "Could not resolve products in database" },
        { status: 400 }
      );
    }

    const status = method === "manual" ? "PENDING" : "PAID";
    const orderRows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `
      INSERT INTO "Order" ("id", "buyerId", "total", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3::"OrderStatus", NOW(), NOW())
      RETURNING id
      `,
      buyerId,
      total,
      status
    );
    const orderId = orderRows[0].id;

    for (const it of resolved) {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "OrderItem" ("id", "orderId", "itemId", "licenseType", "price")
        VALUES (gen_random_uuid()::text, $1, $2, $3::"LicenseType", $4)
        `,
        orderId,
        it.itemId,
        it.licenseType,
        it.price
      );
    }

    return NextResponse.json({
      ok: true,
      permanent: true,
      orderId,
      buyerId,
      status,
      items: resolved,
      message: "Order saved to database",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    console.error("Order POST failed:", message);
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
        { error: "Sign in or provide email to load purchases", items: [] },
        { status: 401 }
      );
    }

    let buyerIds: string[] = [];
    if (sessionId && sessionId !== "admin-env") buyerIds.push(sessionId);
    if (email) {
      const users = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM "User" WHERE lower(email) = lower($1)`,
        email
      );
      buyerIds.push(...users.map((u) => u.id));
    }
    buyerIds = [...new Set(buyerIds)];
    if (buyerIds.length === 0) {
      return NextResponse.json({ items: [], source: "db" });
    }

    const placeholders = buyerIds.map((_, i) => `$${i + 1}`).join(", ");
    const rows = await prisma.$queryRawUnsafe<
      Array<{
        orderId: string;
        orderStatus: string;
        purchasedAt: Date;
        itemId: string;
        licenseType: string;
        price: number;
        slug: string;
        title: string;
        thumbnailUrl: string;
      }>
    >(
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
      ...buyerIds
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
      purchasedAt: new Date(r.purchasedAt).toISOString(),
      downloadUrl: `/api/download/${r.itemId}`,
    }));

    return NextResponse.json({ items, source: "db", permanent: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    console.error("Order GET failed:", message);
    return NextResponse.json({ error: message, items: [] }, { status: 500 });
  }
}
