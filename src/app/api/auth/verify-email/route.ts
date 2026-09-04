import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/users-db";
import { appBaseUrl } from "@/lib/email";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  if (!token) {
    return NextResponse.redirect(`${appBaseUrl()}/sign-in?error=missing_token`);
  }
  const result = await verifyEmailToken(token);
  if (!result.ok) {
    return NextResponse.redirect(
      `${appBaseUrl()}/sign-in?error=${encodeURIComponent(result.error)}`
    );
  }
  return NextResponse.redirect(`${appBaseUrl()}/sign-in?verified=1`);
}
