import { NextResponse } from "next/server";
import { getProductDetail } from "@/lib/product-store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || undefined;
  const product = await getProductDetail(id, slug);
  return NextResponse.json({ product });
}
