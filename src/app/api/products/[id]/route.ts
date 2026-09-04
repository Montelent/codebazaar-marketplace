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
  if (!product) {
    return NextResponse.json({ product: null }, { status: 404 });
  }
  return NextResponse.json({
    product: {
      ...product,
      regularPrice: Number(product.regularPrice ?? 0),
      extendedPrice: Number(product.extendedPrice ?? 0),
      salePriceRegular:
        product.salePriceRegular != null
          ? Number(product.salePriceRegular)
          : null,
      salePriceExtended:
        product.salePriceExtended != null
          ? Number(product.salePriceExtended)
          : null,
    },
  });
}
