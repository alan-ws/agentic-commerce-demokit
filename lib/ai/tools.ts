import { tool } from "ai";
import { z } from "zod";
import {
  searchProducts,
  getProductById,
  compareProducts,
} from "@/lib/commerce/products";
import { checkAvailability } from "@/lib/commerce/availability";
import { getPurchaseChannels } from "@/lib/commerce/routing";

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
        products: results.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          abv: p.abv,
          volume: p.volume,
          description: p.description,
          flavorProfile: p.flavorProfile,
          occasions: p.occasions,
        })),
        count: results.length,
      };
    },
  }),

  get_product_details: tool({
    description:
      "Get full details for a specific product including tasting notes, description, and pricing.",
    inputSchema: z.object({
      productId: z.string().describe("The product ID"),
    }),
    execute: async ({ productId }) => {
      const product = getProductById(productId);
      if (!product) return { error: "Product not found" };
      return product;
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
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          abv: p.abv,
          volume: p.volume,
          flavorProfile: p.flavorProfile,
          tastingNotes: p.tastingNotes,
        })),
      };
    },
  }),
};
