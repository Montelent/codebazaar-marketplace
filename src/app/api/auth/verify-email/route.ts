import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/users-db";
import { appBaseUrl } from "@/lib/email";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const base = appBaseUrl();
  if (!token) {
    return NextResponse.redirect(`${base}/sign-in?verify=missing`);
  }
  const result = await verifyEmailToken(token);
  if (!result.ok) {
    return NextResponse.redirect(
      `${base}/sign-in?verify=failed&reason=${encodeURIComponent(result.error || "invalid")}`
    );
  }
  return NextResponse.redirect(`${base}/sign-in?verify=ok`);
}
