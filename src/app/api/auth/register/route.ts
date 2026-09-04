import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
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
    const user = await queryOne<{ id: string; email: string; username: string }>(
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

    let verificationSent = false;
    try {
      const token = await createEmailVerificationToken(email);
      const verifyUrl = `${appBaseUrl()}/api/auth/verify-email?token=${token}`;
      const sent = await sendEmail({
        to: email,
        subject: "Verify your CodeBazaar email",
        html: `
          <p>Hi ${name || username},</p>
          <p>Thanks for signing up at CodeBazaar. Please verify your email:</p>
          <p><a href="${verifyUrl}">Verify email address</a></p>
          <p>Or copy this link: ${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
        `,
        text: `Verify your email: ${verifyUrl}`,
      });
      verificationSent = sent.ok;
    } catch (err) {
      console.error("verification email", err);
    }

    return NextResponse.json(
      {
        ok: true,
        user,
        verificationSent,
        message: verificationSent
          ? "Account created. Check your email to verify."
          : "Account created. Verification email could not be sent (check RESEND_API_KEY).",
      },
      { status: 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
