import { NextResponse } from "next/server";

/** Best-effort order log — client purchases store powers Downloads for now */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Order received", {
      email: body.email,
      total: body.total,
      count: Array.isArray(body.items) ? body.items.length : 0,
      method: body.method,
    });
    return NextResponse.json({ ok: true, id: `local-${Date.now()}` });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bad request" },
      { status: 400 }
    );
  }
}
