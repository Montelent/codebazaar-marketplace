import Stripe from "stripe";
import { getAllSettings } from "@/lib/settings";

export async function getStripeSecretKey(): Promise<string | null> {
  const env = process.env.STRIPE_SECRET_KEY?.trim();
  if (env) return env;
  try {
    const s = await getAllSettings();
    const k = s["payments.stripeSecretKey"] || s["payments.stripe.secretKey"];
    if (typeof k === "string" && k.trim()) return k.trim();
  } catch {
    /* ignore */
  }
  return null;
}

export async function getStripeClient(): Promise<Stripe | null> {
  const key = await getStripeSecretKey();
  if (!key) return null;
  return new Stripe(key);
}

export async function isStripeEnabled(): Promise<boolean> {
  const s = await getAllSettings();
  if (s["payments.stripeEnabled"] === false) return false;
  const key = await getStripeSecretKey();
  return Boolean(key);
}
