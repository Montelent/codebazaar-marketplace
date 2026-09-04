import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { ensureUserEmailColumns } from "@/lib/users-db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const subject = String(body.subject || "").trim();
  const html = String(body.html || body.body || "").trim();
  if (!subject || !html) {
    return NextResponse.json({ error: "Subject and body required" }, { status: 400 });
  }

  await ensureUserEmailColumns();
  let emails: string[] = [];
  try {
    const { rows } = await query<{ email: string }>(
      `SELECT email FROM "User"
       WHERE (newsletter IS NULL OR newsletter = true)
         AND email IS NOT NULL
       LIMIT 2000`
    );
    emails = rows.map((r) => r.email).filter(Boolean);
  } catch {
    const { rows } = await query<{ email: string }>(
      `SELECT email FROM "User" WHERE email IS NOT NULL LIMIT 2000`
    );
    emails = rows.map((r) => r.email).filter(Boolean);
  }

  if (!emails.length) {
    return NextResponse.json({ error: "No subscribers found", sent: 0 }, { status: 400 });
  }

  let sent = 0;
  const errors: string[] = [];
  for (const to of emails) {
    const r = await sendEmail({ to, subject, html });
    if (r.ok) sent += 1;
    else if (r.error) errors.push(`${to}: ${r.error}`);
  }

  return NextResponse.json({
    ok: true,
    sent,
    total: emails.length,
    errors: errors.slice(0, 10),
  });
}
