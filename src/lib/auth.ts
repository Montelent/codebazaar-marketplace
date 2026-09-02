import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/sign-in", error: "/sign-in" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email",
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
        if (envEmail && envPassword && email === envEmail && password === envPassword) {
          return { id: "admin-env", email: envEmail, name: "CodeBazaar Admin", role: "ADMIN" };
        }
        try {
          const user = await queryOne<{
            id: string; email: string; name: string | null; username: string; role: string; passwordHash: string | null;
          }>(
            `SELECT id, email, name, username, role::text AS role, "passwordHash" FROM "User" WHERE lower(email) = lower($1) LIMIT 1`,
            [email]
          );
          if (!user?.passwordHash) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name ?? user.username, role: user.role ?? "BUYER" };
        } catch {
          return null;
        }
      },
    }),
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
        if (envEmail && envPassword && email === envEmail && password === envPassword) {
          return { id: "admin-env", email: envEmail, name: "CodeBazaar Admin", role: "ADMIN" };
        }
        try {
          const user = await queryOne<{
            id: string; email: string; name: string | null; username: string; role: string; passwordHash: string | null;
          }>(
            `SELECT id, email, name, username, role::text AS role, "passwordHash" FROM "User" WHERE lower(email) = lower($1) LIMIT 1`,
            [email]
          );
          if (!user?.passwordHash || user.role !== "ADMIN") return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name ?? user.username, role: "ADMIN" };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "BUYER";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) ?? "BUYER";
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
