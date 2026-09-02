import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";

export async function POST(req: Request) {
  try {
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
      return NextResponse.json({ error: "Email or username already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await queryOne<{ id: string; email: string; username: string }>(
      `
      INSERT INTO "User" ("id", "email", "username", "name", "passwordHash", "role", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'BUYER', NOW(), NOW())
      RETURNING id, email, username
      `,
      [email, username, name || username, passwordHash]
    );

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
