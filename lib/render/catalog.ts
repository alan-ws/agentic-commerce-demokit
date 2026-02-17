import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const catalog = defineCatalog(schema, {
  components: {
    ProductCard: {
      props: z.object({
        productId: z.string(),
        name: z.string(),
        brand: z.string(),
        category: z.string(),
        price: z.number(),
        currency: z.string(),
        image: z.string().nullable(),
        description: z.string(),
        abv: z.number(),
        volume: z.string(),
        tastingNotes: z
          .object({
            nose: z.string(),
            palate: z.string(),
            finish: z.string(),
          })
          .nullable(),
        flavorProfile: z.array(z.string()).nullable(),
      }),
      description:
        "Displays a single product recommendation card. Only use for a SINGLE product. For multiple products use ProductCarousel instead.",
    },
    ProductCarousel: {
      props: z.object({
        products: z.array(
          z.object({
            productId: z.string(),
            name: z.string(),
            brand: z.string(),
            category: z.string(),
            price: z.number(),
            currency: z.string(),
            image: z.string().nullable(),
            description: z.string(),
            abv: z.number(),
            volume: z.string(),
            tastingNotes: z
              .object({
                nose: z.string(),
                palate: z.string(),
                finish: z.string(),
              })
              .nullable(),
            flavorProfile: z.array(z.string()).nullable(),
          })
        ),
      }),
      description:
        "Displays multiple product recommendations in a horizontal scrollable carousel. ALWAYS use this instead of multiple ProductCard components when recommending 2 or more products.",
    },
    ComparisonGrid: {
      props: z.object({
        products: z.array(
          z.object({
            productId: z.string(),
            name: z.string(),
            brand: z.string(),
            category: z.string(),
            price: z.number(),
            currency: z.string(),
            abv: z.number(),
            volume: z.string(),
            flavorProfile: z.array(z.string()).nullable(),
          })
        ),
      }),
      description:
        "Displays a side-by-side comparison of 2-3 products. Use when the user wants to compare options.",
    },
    ChannelRouter: {
      props: z.object({
        productId: z.string(),
        productName: z.string(),
        channels: z.array(
          z.object({
            type: z.enum(["d2c", "retailer"]),
            name: z.string(),
            url: z.string(),
            priority: z.number(),
          })
        ),
      }),
      description:
        "Shows purchase options (D2C vs retailer links) for a product. Use when showing where to buy.",
    },
    AgeGatePrompt: {
      props: z.object({
        market: z.string(),
        requiredAge: z.number(),
      }),
      description:
        "Prompts the user to verify their age. Use when age verification is needed before proceeding.",
    },
  },
  actions: {
    view_product: {
      params: z.object({ productId: z.string() }),
      description: "Navigate to view full product details",
    },
    route_to_channel: {
      params: z.object({ channelUrl: z.string() }),
      description: "Open a purchase channel URL",
    },
    verify_age: {
      params: z.object({ dateOfBirth: z.string(), market: z.string() }),
      description: "Submit age verification",
    },
  },
});

export type Catalog = typeof catalog;
