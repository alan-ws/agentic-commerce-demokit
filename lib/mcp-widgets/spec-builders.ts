import { nestedToFlat } from "@json-render/core";
import type { Product } from "@/lib/commerce/products";

/**
 * Build a json-render spec for a single product card.
 * The spec shape matches the ProductCard catalog component exactly.
 */
export function buildProductCardSpec(product: Product, baseUrl: string) {
  return nestedToFlat({
    type: "ProductCard",
    props: {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price["GBP"] ?? 0,
      currency: "GBP",
      image: `${baseUrl}${product.image}`,
      description: product.description,
      abv: product.abv,
      volume: product.volume,
      tastingNotes: product.tastingNotes,
      flavorProfile: product.flavorProfile,
    },
  });
}

/**
 * Build a json-render spec for a product carousel / grid.
 * The spec shape matches the ProductCarousel catalog component.
 */
export function buildProductGridSpec(products: Product[], baseUrl: string) {
  return nestedToFlat({
    type: "ProductCarousel",
    props: {
      products: products.map((p) => ({
        productId: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price["GBP"] ?? 0,
        currency: "GBP",
        image: `${baseUrl}${p.image}`,
        description: p.description,
        abv: p.abv,
        volume: p.volume,
        tastingNotes: p.tastingNotes,
        flavorProfile: p.flavorProfile,
      })),
    },
  });
}

/**
 * Build a json-render spec for the channel router.
 * The spec shape matches the ChannelRouter catalog component.
 */
export function buildChannelRouterSpec(data: {
  productId: string;
  productName: string;
  channels: { type: "d2c" | "retailer"; name: string; url: string; priority: number }[];
}) {
  return nestedToFlat({
    type: "ChannelRouter",
    props: data,
  });
}
