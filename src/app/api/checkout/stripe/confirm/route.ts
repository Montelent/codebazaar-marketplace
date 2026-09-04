import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { query, queryOne } from "@/lib/db";

type CartLine = {
  itemId: string;
  slug?: string;
  title?: string;
  price?: number;
  licenseType?: string;
  thumbnailUrl?: string;
};

async function resolveBuyerId(email: string, name?: string) {
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
    const body = await req.json();
    const sessionId = String(body.sessionId || body.session_id || "").trim();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const stripe = await getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { error: `Payment not complete (status: ${session.payment_status})` },
        { status: 402 }
      );
    }

    // Idempotency: if we already stored this session as PAID, return it
    try {
      const existing = await queryOne<{ id: string }>(
        `SELECT id FROM "Order" WHERE "stripeSessionId" = $1 LIMIT 1`,
        [sessionId]
      );
      if (existing?.id) {
        const { rows } = await query(
          `
          SELECT oi."licenseType"::text AS "licenseType", oi.price, i.title
          FROM "OrderItem" oi
          JOIN "Item" i ON i.id = oi."itemId"
          WHERE oi."orderId" = $1
          `,
          [existing.id]
        );
        return NextResponse.json({
          ok: true,
          orderId: existing.id,
          items: rows.map((r) => ({
            title: r.title,
            licenseType: r.licenseType,
            price: Number(r.price),
          })),
          alreadyRecorded: true,
        });
      }
    } catch {
      /* stripeSessionId column may not exist yet */
    }

    const email = String(
      session.customer_email ||
        session.customer_details?.email ||
        session.metadata?.email ||
        ""
    )
      .trim()
      .toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "No customer email on session" }, { status: 400 });
    }

    let cart: CartLine[] = [];
    try {
      cart = JSON.parse(session.metadata?.cart || "[]") as CartLine[];
    } catch {
      cart = [];
    }
    if (!cart.length) {
      return NextResponse.json({ error: "No cart metadata on session" }, { status: 400 });
    }

    const name = String(session.metadata?.name || "");
    const buyerId = await resolveBuyerId(email, name);
    const total = Number(session.amount_total || 0) / 100;

    const resolved = [];
    for (const it of cart) {
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
        title: dbItem.title,
      });
    }
    if (!resolved.length) {
      return NextResponse.json({ error: "Could not resolve products" }, { status: 400 });
    }

    // Ensure optional column for idempotency
    try {
      await query(
        `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT`
      );
    } catch {
      /* ignore */
    }

    let order: { id: string } | null = null;
    try {
      order = await queryOne<{ id: string }>(
        `
        INSERT INTO "Order" ("id", "buyerId", "total", "status", "stripeSessionId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, 'PAID'::"OrderStatus", $3, NOW(), NOW())
        RETURNING id
        `,
        [buyerId, total, sessionId]
      );
    } catch {
      order = await queryOne<{ id: string }>(
        `
        INSERT INTO "Order" ("id", "buyerId", "total", "status", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, 'PAID'::"OrderStatus", NOW(), NOW())
        RETURNING id
        `,
        [buyerId, total]
      );
    }

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
      orderId: order!.id,
      items: resolved,
      permanent: true,
    });
  } catch (e) {
    console.error("stripe confirm", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Confirm failed" },
      { status: 500 }
    );
  }
}
