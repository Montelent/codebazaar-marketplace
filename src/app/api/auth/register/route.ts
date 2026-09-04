import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";
import {
  createEmailVerificationToken,
  ensureUserEmailColumns,
} from "@/lib/users-db";
import { appBaseUrl, sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await ensureUserEmailColumns();
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const username =
      String(body.username || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "") || email.split("@")[0];

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Valid email and password (min 6 chars) required" },
        { status: 400 }
      );
    }

    const exists = await queryOne(
      `SELECT id FROM "User" WHERE lower(email) = lower($1) OR username = $2 LIMIT 1`,
      [email, username]
    );
    if (exists) {
      return NextResponse.json(
        { error: "Email or username already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user: { id: string; email: string; username: string } | null = null;
    let lastError = "";

    try {
      user = await queryOne(
        `
        INSERT INTO "User" (
          "id", "email", "username", "name", "passwordHash", "role",
          newsletter, "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, 'BUYER',
          true, NOW(), NOW()
        )
        RETURNING id, email, username
        `,
        [email, username, name || username, passwordHash]
      );
    } catch (e) {
      lastError = e instanceof Error ? e.message : "insert failed";
      try {
        user = await queryOne(
          `
          INSERT INTO "User" (
            "id", "email", "username", "name", "passwordHash", "role",
            "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, 'BUYER',
            NOW(), NOW()
          )
          RETURNING id, email, username
          `,
          [email, username, name || username, passwordHash]
        );
      } catch (e2) {
        lastError = e2 instanceof Error ? e2.message : lastError;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Could not create user in database", detail: lastError },
        { status: 500 }
      );
    }

    try {
      await query(`UPDATE "User" SET newsletter = true WHERE id = $1`, [user.id]);
    } catch {
      /* optional */
    }

    let verificationSent = false;
    let emailNote = "";
    try {
      const token = await createEmailVerificationToken(email);
      const verifyUrl = `${appBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
      const sent = await sendEmail({
        to: email,
        subject: "Verify your CodeBazaar email",
        html: `
          <p>Hi ${name || username},</p>
          <p>Thanks for signing up at CodeBazaar. Please verify your email:</p>
          <p><a href="${verifyUrl}">Verify email address</a></p>
          <p>Or copy this link:<br/>${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
        `,
        text: `Verify your email: ${verifyUrl}`,
      });
      verificationSent = sent.ok && !sent.error;
      if (sent.error) emailNote = sent.error;
    } catch (err) {
      emailNote = err instanceof Error ? err.message : "email error";
      console.error("verification email", err);
    }

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, username: user.username },
      verificationSent,
      emailNote: emailNote || undefined,
      message: verificationSent
        ? "Account created. Check your email to verify."
        : "Account created in database. Set RESEND_API_KEY on Vercel to send verification emails.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Registration failed" },
      { status: 500 }
    );
  }
}
