import { notFound } from "next/navigation";
import { getProductDetail, listProductCards } from "@/lib/product-store";
import { ItemDetailClient } from "@/components/items/item-detail-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const product = await getProductDetail(id, slug);
  if (!product || (!product.title && !product.slug)) {
    notFound();
  }

  if (!product.title) {
    product.title = product.slug || "Product";
  }

  const all = await listProductCards().catch(() => []);
  const related = all
    .filter(
      (i) =>
        i.id !== product.id &&
        i.slug !== product.slug &&
        i.category?.slug === product.category?.slug
    )
    .slice(0, 4);

  if (related.length < 4) {
    for (const i of all) {
      if (related.length >= 4) break;
      if (i.id === product.id || i.slug === product.slug) continue;
      if (related.some((r) => r.id === i.id)) continue;
      related.push(i);
    }
  }

  return <ItemDetailClient product={product} related={related} />;
}
