import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Protect admin UI + admin APIs only.
 * /admin/login is intentionally NOT in the matcher to avoid redirect loops.
 */
export default withAuth(
  function middleware(req) {
    // Token exists (authorized passed), but must be ADMIN
    if (req.nextauth.token?.role !== "ADMIN") {
      const login = new URL("/admin/login", req.url);
      login.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // Unauthenticated → withAuth sends user to pages.signIn (/admin/login)
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Exact /admin dashboard
    "/admin",
    // Nested admin routes EXCEPT login
    "/admin/((?!login).*)",
    // Admin APIs
    "/api/admin/:path*",
  ],
};
