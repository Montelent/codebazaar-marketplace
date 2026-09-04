import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { listUsers } from "@/lib/users-db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listUsers();
    return NextResponse.json({
      users: rows.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name || u.username,
        username: u.username,
        role: u.role,
        emailVerified: Boolean(u.emailVerified),
        newsletter: u.newsletter !== false,
        createdAt: u.createdAt,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error", users: [] },
      { status: 500 }
    );
  }
}
