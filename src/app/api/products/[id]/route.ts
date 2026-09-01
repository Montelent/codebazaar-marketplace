import { NextResponse } from "next/server";
import { getProductDetail } from "@/lib/product-store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductDetail(id);
  return NextResponse.json({ product });
}
