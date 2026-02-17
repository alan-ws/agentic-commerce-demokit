"use server";

import { searchProducts } from "@/lib/commerce/products";
import type { ProductSearchParams } from "@/lib/commerce/products";
import type { Spec } from "@json-render/core";

function mapBudgetToPrice(budget: string): { minPrice?: number; maxPrice?: number } {
  switch (budget) {
    case "under-30":
      return { maxPrice: 30 };
    case "30-50":
      return { minPrice: 30, maxPrice: 50 };
    case "50-100":
      return { minPrice: 50, maxPrice: 100 };
    case "100-plus":
      return { minPrice: 100 };
    case "no-limit":
    default:
      return {};
  }
}

function marketToCurrency(market: string): string {
  const map: Record<string, string> = {
    GB: "GBP",
    US: "USD",
    DE: "EUR",
    FR: "EUR",
  };
  return map[market] ?? "USD";
}

export async function searchProductsAction(
  selections: Record<string, string>
): Promise<Spec> {
  const { occasion, taste, budget, market } = selections;
  const priceRange = mapBudgetToPrice(budget);
  const currency = marketToCurrency(market ?? "GB");

  // Build search params
  const params: ProductSearchParams = {
    occasion,
    flavor: taste,
    market: market ?? "GB",
    ...priceRange,
  };

  let results = searchProducts(params);

  // Fallback: if 0 results, progressively relax filters
  if (results.length === 0) {
    // Drop budget
    const relaxed1: ProductSearchParams = { occasion, flavor: taste, market: market ?? "GB" };
    results = searchProducts(relaxed1);
  }

  if (results.length === 0) {
    // Drop taste too
    const relaxed2: ProductSearchParams = { occasion, market: market ?? "GB" };
    results = searchProducts(relaxed2);
  }

  if (results.length === 0) {
    // Just market
    const relaxed3: ProductSearchParams = { market: market ?? "GB" };
    results = searchProducts(relaxed3);
  }

  // Take top 3
  const top = results.slice(0, 3);

  if (top.length === 0) {
    // No products found at all — return a message spec
    return {
      root: "empty",
      elements: {
        empty: {
          type: "OptionGrid",
          props: {
            stepId: "empty",
            prompt: "No products found",
            description:
              "We couldn't find products matching your criteria. Try different selections.",
            options: [],
            selected: null,
          },
        },
      },
    };
  }

  // Build ProductCarousel spec
  const products = top.map((p) => ({
    productId: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price[currency] ?? p.price["USD"] ?? 0,
    currency,
    image: p.image,
    description: p.description,
    abv: p.abv,
    volume: p.volume,
    tastingNotes: p.tastingNotes,
    flavorProfile: p.flavorProfile,
  }));

  return {
    root: "carousel",
    elements: {
      carousel: {
        type: "ProductCarousel",
        props: { products },
      },
    },
  };
}
