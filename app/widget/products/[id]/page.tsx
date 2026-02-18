import { notFound } from "next/navigation";
import { getProductById } from "@/lib/commerce/products";
import { ContentHeader } from "@/components/widget/content-header";
import { ProductDetail } from "@/components/widget/product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <ContentHeader productName={product.name} />
      <div className="flex-1 overflow-y-auto">
        <ProductDetail product={product} />
      </div>
    </div>
  );
}
