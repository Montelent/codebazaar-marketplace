import { query, queryOne } from "@/lib/db";
import crypto from "crypto";

export async function ensureUserEmailColumns() {
  try {
    await query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP`);
  } catch {
    /* ignore */
  }
  try {
    await query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS newsletter BOOLEAN DEFAULT true`);
  } catch {
    /* ignore */
  }
}

export async function createEmailVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  try {
    await query(`DELETE FROM "VerificationToken" WHERE identifier = $1`, [email]);
    await query(
      `INSERT INTO "VerificationToken" (identifier, token, expires) VALUES ($1, $2, $3)`,
      [email, token, expires.toISOString()]
    );
  } catch {
    try {
      await query(
        `CREATE TABLE IF NOT EXISTS "VerificationToken" (
          identifier TEXT NOT NULL,
          token TEXT NOT NULL,
          expires TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (identifier, token)
        )`
      );
      await query(
        `INSERT INTO "VerificationToken" (identifier, token, expires) VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [email, token, expires.toISOString()]
      );
    } catch {
      /* ignore */
    }
  }
  return token;
}

export async function verifyEmailToken(token: string) {
  await ensureUserEmailColumns();
  const row = await queryOne<{ identifier: string; expires: Date | string }>(
    `SELECT identifier, expires FROM "VerificationToken" WHERE token = $1 LIMIT 1`,
    [token]
  );
  if (!row) return { ok: false as const, error: "Invalid token" };
  if (new Date(row.expires).getTime() < Date.now()) {
    return { ok: false as const, error: "Token expired" };
  }
  await query(
    `UPDATE "User" SET "emailVerified" = NOW(), "updatedAt" = NOW() WHERE lower(email) = lower($1)`,
    [row.identifier]
  );
  await query(`DELETE FROM "VerificationToken" WHERE token = $1`, [token]).catch(() => {});
  return { ok: true as const, email: row.identifier };
}

export async function listUsers() {
  await ensureUserEmailColumns();
  try {
    const { rows } = await query<{
      id: string;
      email: string;
      name: string | null;
      username: string;
      role: string;
      emailVerified: Date | string | null;
      newsletter: boolean | null;
      createdAt: Date | string | null;
    }>(
      `SELECT id, email, name, username, role::text AS role,
              "emailVerified", newsletter, "createdAt"
       FROM "User"
       ORDER BY "createdAt" DESC NULLS LAST
       LIMIT 500`
    );
    return rows;
  } catch {
    const { rows } = await query<{
      id: string;
      email: string;
      name: string | null;
      username: string;
      role: string;
      createdAt: Date | string | null;
    }>(
      `SELECT id, email, name, username, role::text AS role, "createdAt"
       FROM "User" ORDER BY "createdAt" DESC NULLS LAST LIMIT 500`
    );
    return rows.map((r) => ({ ...r, emailVerified: null, newsletter: true }));
  }
}
