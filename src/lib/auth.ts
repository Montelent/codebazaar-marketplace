import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/**
 * Single-vendor admin auth.
 * Primary: ADMIN_EMAIL + ADMIN_PASSWORD env (works without DB).
 * Optional: ADMIN user row in Postgres with passwordHash.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const envPassword = process.env.ADMIN_PASSWORD;

        // Env bootstrap (preferred for Vercel until DB is seeded)
        if (envEmail && envPassword && email === envEmail && password === envPassword) {
          return {
            id: "admin-env",
            email: envEmail,
            name: "CodeBazaar Admin",
            role: "ADMIN",
          };
        }

        // DB-backed admin (lazy-load prisma so auth module stays light)
        try {
          const { prisma } = await import("@/lib/prisma");
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash || user.role !== "ADMIN") return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? user.username,
            role: "ADMIN",
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "ADMIN";
        token.id = user.id;
        token.email = user.email;
      }
      // Ensure role survives subsequent JWT refreshes
      if (!token.role) token.role = "ADMIN";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || "ADMIN";
        session.user.id = token.id as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  // Support both naming conventions used on Vercel
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
