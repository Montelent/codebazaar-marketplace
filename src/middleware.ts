import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Protect admin UI + admin APIs.
 * /admin/login is NOT matched → no redirect loop.
 */
export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    if (role && role !== "ADMIN") {
      const login = new URL("/admin/login", req.url);
      login.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)", "/api/admin/:path*"],
};
