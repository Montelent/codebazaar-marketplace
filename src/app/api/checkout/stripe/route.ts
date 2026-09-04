import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripeClient, isStripeEnabled } from "@/lib/stripe";
import { appBaseUrl } from "@/lib/email";

type Line = {
  itemId: string;
  slug?: string;
  title: string;
  price: number;
  licenseType?: string;
  quantity?: number;
};

export async function POST(req: Request) {
  try {
    if (!(await isStripeEnabled())) {
      return NextResponse.json(
        {
          error:
            "Stripe is not enabled. Add STRIPE_SECRET_KEY and enable Stripe in Admin → Payments.",
        },
        { status: 400 }
      );
    }
    const stripe = await getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe secret key missing" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const body = await req.json();
    const email = String(body.email || session?.user?.email || "").trim().toLowerCase();
    const items = (body.items || []) as Line[];
    if (!email || !items.length) {
      return NextResponse.json({ error: "Email and items required" }, { status: 400 });
    }

    const line_items = items
      .filter((i) => Number(i.price) > 0)
      .map((i) => ({
        quantity: Math.max(1, Number(i.quantity) || 1),
        price_data: {
          currency: String(body.currency || "usd").toLowerCase(),
          unit_amount: Math.round(Number(i.price) * 100),
          product_data: {
            name: `${i.title}${i.licenseType ? ` (${i.licenseType})` : ""}`,
            metadata: {
              itemId: String(i.itemId || ""),
              slug: String(i.slug || ""),
              licenseType: String(i.licenseType || "REGULAR"),
            },
          },
        },
      }));

    if (!line_items.length) {
      return NextResponse.json({ error: "No payable items" }, { status: 400 });
    }

    const base = appBaseUrl();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items,
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout?canceled=1`,
      metadata: {
        email,
        name: String(body.name || ""),
        cart: JSON.stringify(
          items.map((i) => ({
            itemId: i.itemId,
            slug: i.slug,
            title: i.title,
            price: i.price,
            licenseType: i.licenseType || "REGULAR",
          }))
        ),
      },
    });

    return NextResponse.json({ url: checkout.url, sessionId: checkout.id });
  } catch (e) {
    console.error("stripe checkout", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stripe error" },
      { status: 500 }
    );
  }
}
