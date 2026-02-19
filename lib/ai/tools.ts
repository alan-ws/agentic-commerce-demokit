import { tool } from "ai";
import { z } from "zod";
import {
  searchProducts,
  getProductById,
  compareProducts,
  type Product,
} from "@/lib/commerce/products";
import { checkAvailability } from "@/lib/commerce/availability";
import { getPurchaseChannels } from "@/lib/commerce/routing";

const marketToCurrency: Record<string, string> = {
  GB: "GBP",
  US: "USD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
};

function resolvePrice(product: Product, market?: string) {
  const currency = marketToCurrency[market ?? "GB"] ?? "GBP";
  return { price: product.price[currency] ?? product.price["GBP"] ?? 0, currency };
}

export const commerceTools = {
  search_products: tool({
    description:
      "Search the product catalogue by text query, category, occasion, flavor profile, or price range. Returns matching products.",
    inputSchema: z.object({
      q: z.string().optional().describe("Text search query"),
      category: z
        .enum([
          "scotch",
          "irish-whiskey",
          "vodka",
          "gin",
          "tequila",
          "rum",
          "beer",
        ])
        .optional()
        .describe("Product category"),
      occasion: z
        .enum([
          "gifting",
          "celebration",
          "casual-drink",
          "cocktails",
          "dinner-pairing",
        ])
        .optional()
        .describe("Target occasion"),
      flavor: z
        .string()
        .optional()
        .describe(
          "Comma-separated flavor profiles: smoky, sweet, spicy, fruity, smooth, bold"
        ),
      minPrice: z.number().optional().describe("Minimum price"),
      maxPrice: z.number().optional().describe("Maximum price"),
      market: z
        .string()
        .optional()
        .describe("Market code (e.g., GB, US) for currency"),
    }),
    execute: async (params) => {
      const results = searchProducts(params);
      return {
        products: results.map((p) => {
          const { price, currency } = resolvePrice(p, params.market);
          return {
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            price,
            currency,
            abv: p.abv,
            volume: p.volume,
            description: p.description,
            flavorProfile: p.flavorProfile,
            occasions: p.occasions,
          };
        }),
        count: results.length,
      };
    },
  }),

  get_product_details: tool({
    description:
      "Get full details for a specific product including tasting notes, description, and pricing.",
    inputSchema: z.object({
      productId: z.string().describe("The product ID"),
      market: z.string().optional().describe("Market code for pricing (e.g., GB, US)"),
    }),
    execute: async ({ productId, market }) => {
      const product = getProductById(productId);
      if (!product) return { error: "Product not found" };
      const { price, currency } = resolvePrice(product, market);
      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory,
        description: product.description,
        tastingNotes: product.tastingNotes,
        abv: product.abv,
        volume: product.volume,
        price,
        currency,
        image: product.image,
        occasions: product.occasions,
        flavorProfile: product.flavorProfile,
      };
    },
  }),

  check_availability: tool({
    description:
      "Check if a product is available in a specific market and through which channels.",
    inputSchema: z.object({
      productId: z.string().describe("The product ID"),
      market: z.string().describe("Market code (e.g., GB, US)"),
    }),
    execute: async ({ productId, market }) => {
      return checkAvailability(productId, market);
    },
  }),

  get_purchase_channels: tool({
    description:
      "Get the available purchase channels (D2C and retailer links) for a product in a specific market.",
    inputSchema: z.object({
      productId: z.string().describe("The product ID"),
      market: z.string().describe("Market code (e.g., GB, US)"),
    }),
    execute: async ({ productId, market }) => {
      const channels = getPurchaseChannels(productId, market);
      const product = getProductById(productId);
      return {
        productId,
        productName: product?.name ?? productId,
        market,
        channels,
      };
    },
  }),

  compare_products: tool({
    description:
      "Compare 2-3 products side by side. Returns detailed info for each product for comparison.",
    inputSchema: z.object({
      productIds: z
        .array(z.string())
        .min(2)
        .max(3)
        .describe("Array of product IDs to compare"),
    }),
    execute: async ({ productIds }) => {
      const products = compareProducts(productIds);
      return {
        products: products.map((p) => {
          const { price, currency } = resolvePrice(p);
          return {
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            price,
            currency,
            abv: p.abv,
            volume: p.volume,
            flavorProfile: p.flavorProfile,
            tastingNotes: p.tastingNotes,
          };
        }),
      };
    },
  }),
};
