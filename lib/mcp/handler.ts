/**
 * MCP Server — UCP Transport + Commerce Discovery Tools
 * Spec: .ucp-spec/source/services/shopping/mcp.openrpc.json
 *
 * UCP checkout tools (spec methods):
 *   create_checkout, get_checkout, update_checkout, complete_checkout, cancel_checkout
 *
 * Commerce discovery tools (complementary):
 *   search_products, get_product, check_availability, get_purchase_channels, get_compliance_info
 */

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { brand } from "@/config/brand";
import { searchProducts, getProductById } from "@/lib/commerce/products";
import { checkAvailability } from "@/lib/commerce/availability";
import { getPurchaseChannels } from "@/lib/commerce/routing";
import { getComplianceInfo } from "@/lib/commerce/compliance";
import {
  createCheckout,
  getCheckout,
  updateCheckout,
  completeCheckout,
  cancelCheckout,
} from "@/lib/ucp/handlers/checkout";
import { negotiateCapabilities } from "@/lib/ucp/negotiation";
import { generateProfile } from "@/lib/ucp/profile";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(code: string, message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: { code, message } }),
      },
    ],
    isError: true,
  };
}

export const mcpHandler = createMcpHandler(
  (server) => {
    // =========================================================================
    // UCP Discovery
    // =========================================================================

    server.registerTool(
      "ucp_get_profile",
      {
        title: "Get UCP Profile",
        description:
          "Get the UCP discovery profile for this business. Returns supported capabilities, transports, and payment handlers.",
        inputSchema: {},
      },
      async () => jsonResult(generateProfile(BASE_URL))
    );

    // =========================================================================
    // UCP Checkout (spec: mcp.openrpc.json methods)
    // =========================================================================

    server.registerTool(
      "create_checkout",
      {
        title: "Create Checkout Session",
        description:
          "Create a new UCP checkout session with line items. Returns a checkout session with id, status, totals, and messages.",
        inputSchema: {
          line_items: z
            .array(
              z.object({
                item: z.object({
                  id: z.string().describe("Product ID / SKU"),
                }),
                quantity: z
                  .number()
                  .int()
                  .positive()
                  .describe("Quantity to purchase"),
              })
            )
            .min(1)
            .describe("Items to check out"),
          buyer: z
            .object({
              first_name: z.string().optional(),
              last_name: z.string().optional(),
              email: z.string().optional().describe("Buyer email"),
              phone_number: z.string().optional(),
              consent: z
                .object({
                  analytics: z.boolean().optional(),
                  preferences: z.boolean().optional(),
                  marketing: z.boolean().optional(),
                  sale_of_data: z.boolean().optional(),
                })
                .optional()
                .describe("GDPR/CCPA consent flags"),
            })
            .optional()
            .describe("Buyer information"),
          context: z
            .object({
              geo: z
                .object({
                  country: z
                    .string()
                    .optional()
                    .describe("ISO 3166-1 alpha-2 country code"),
                })
                .optional(),
            })
            .optional()
            .describe("Context for currency/locale determination"),
        },
      },
      async ({ line_items, buyer, context }) => {
        try {
          const negotiation = await negotiateCapabilities();
          const session = await createCheckout(
            { line_items, buyer, context },
            {
              capabilities: negotiation.capabilities,
              baseUrl: BASE_URL,
            }
          );
          return jsonResult(session);
        } catch (error) {
          return errorResult(
            "checkout_creation_failed",
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    );

    server.registerTool(
      "get_checkout",
      {
        title: "Get Checkout Session",
        description:
          "Get the current state of a checkout session by ID.",
        inputSchema: {
          id: z.string().describe("Checkout session ID"),
        },
      },
      async ({ id }) => {
        const session = await getCheckout(id);
        if (!session) {
          return errorResult(
            "checkout_not_found",
            `Checkout session ${id} not found`
          );
        }
        return jsonResult(session);
      }
    );

    server.registerTool(
      "update_checkout",
      {
        title: "Update Checkout Session",
        description:
          "Update a checkout session. Provide fields to replace; omitted fields stay unchanged.",
        inputSchema: {
          id: z.string().describe("Checkout session ID"),
          line_items: z
            .array(
              z.object({
                id: z.string().optional(),
                item: z.object({ id: z.string() }),
                quantity: z.number().int().positive(),
              })
            )
            .optional()
            .describe("Updated line items (replaces existing)"),
          buyer: z
            .object({
              first_name: z.string().optional(),
              last_name: z.string().optional(),
              email: z.string().optional(),
              phone_number: z.string().optional(),
              consent: z
                .object({
                  analytics: z.boolean().optional(),
                  preferences: z.boolean().optional(),
                  marketing: z.boolean().optional(),
                  sale_of_data: z.boolean().optional(),
                })
                .optional(),
            })
            .optional()
            .describe("Updated buyer info"),
          context: z
            .object({
              geo: z
                .object({ country: z.string().optional() })
                .optional(),
            })
            .optional(),
        },
      },
      async ({ id, line_items, buyer, context }) => {
        try {
          const negotiation = await negotiateCapabilities();
          const session = await updateCheckout(
            id,
            { line_items, buyer, context },
            {
              capabilities: negotiation.capabilities,
              baseUrl: BASE_URL,
            }
          );
          if (!session) {
            return errorResult(
              "checkout_not_found",
              `Checkout ${id} not found`
            );
          }
          return jsonResult(session);
        } catch (error) {
          return errorResult(
            "checkout_update_failed",
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    );

    server.registerTool(
      "complete_checkout",
      {
        title: "Complete Checkout",
        description:
          "Complete a checkout session and place the order. Session must be in ready_for_complete status.",
        inputSchema: {
          id: z.string().describe("Checkout session ID"),
          payment: z
            .object({
              instruments: z
                .array(
                  z.object({
                    id: z.string(),
                    handler_id: z.string(),
                    type: z.enum(["card", "wallet", "mandate"]),
                    credential: z
                      .object({ type: z.string(), token: z.string() })
                      .optional(),
                  })
                )
                .optional(),
            })
            .optional()
            .describe("Payment data (mock accepted for demo)"),
        },
      },
      async ({ id, payment }) => {
        try {
          const negotiation = await negotiateCapabilities();
          const session = await completeCheckout(
            id,
            { payment },
            {
              capabilities: negotiation.capabilities,
              baseUrl: BASE_URL,
            }
          );
          if (!session) {
            return errorResult(
              "checkout_not_found",
              `Checkout ${id} not found`
            );
          }
          return jsonResult(session);
        } catch (error) {
          return errorResult(
            "checkout_complete_failed",
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    );

    server.registerTool(
      "cancel_checkout",
      {
        title: "Cancel Checkout",
        description: "Cancel a checkout session.",
        inputSchema: {
          id: z.string().describe("Checkout session ID"),
        },
      },
      async ({ id }) => {
        try {
          const negotiation = await negotiateCapabilities();
          const session = await cancelCheckout(id, {
            capabilities: negotiation.capabilities,
            baseUrl: BASE_URL,
          });
          if (!session) {
            return errorResult(
              "checkout_not_found",
              `Checkout ${id} not found`
            );
          }
          return jsonResult(session);
        } catch (error) {
          return errorResult(
            "checkout_cancel_failed",
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    );

    // =========================================================================
    // Commerce Discovery Tools (complementary, not UCP spec)
    // =========================================================================

    server.registerTool(
      "search_products",
      {
        title: "Search Products",
        description:
          `Search the ${brand.name} product catalogue by text query, category, occasion, flavor, or price range`,
        inputSchema: {
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
            .describe("Occasion"),
          flavor: z
            .string()
            .optional()
            .describe(
              "Comma-separated flavors: smoky, sweet, spicy, fruity, smooth, bold"
            ),
          minPrice: z.number().optional().describe("Minimum price"),
          maxPrice: z.number().optional().describe("Maximum price"),
          market: z
            .string()
            .optional()
            .describe("Market code (GB, US, etc.)"),
        },
      },
      async (params) => {
        const results = searchProducts(params);
        return jsonResult({ products: results, count: results.length });
      }
    );

    server.registerTool(
      "get_product",
      {
        title: "Get Product Details",
        description: "Get full details for a specific product by ID",
        inputSchema: {
          productId: z.string().describe("The product ID"),
        },
      },
      async ({ productId }) => {
        const product = getProductById(productId);
        if (!product) {
          return errorResult("product_not_found", "Product not found");
        }
        return jsonResult(product);
      }
    );

    server.registerTool(
      "check_availability",
      {
        title: "Check Availability",
        description: "Check product availability in a specific market",
        inputSchema: {
          productId: z.string().describe("The product ID"),
          market: z.string().describe("Market code (GB, US, etc.)"),
        },
      },
      async ({ productId, market }) =>
        jsonResult(checkAvailability(productId, market))
    );

    server.registerTool(
      "get_purchase_channels",
      {
        title: "Get Purchase Channels",
        description:
          "Get available purchase channels (D2C and retailer links) for a product in a market",
        inputSchema: {
          productId: z.string().describe("The product ID"),
          market: z.string().describe("Market code (GB, US, etc.)"),
        },
      },
      async ({ productId, market }) => {
        const channels = getPurchaseChannels(productId, market);
        const product = getProductById(productId);
        return jsonResult({
          productId,
          productName: product?.name ?? productId,
          market,
          channels,
        });
      }
    );

    server.registerTool(
      "get_compliance_info",
      {
        title: "Get Compliance Info",
        description:
          "Get compliance information for a market (age threshold, restrictions, content suppressions)",
        inputSchema: {
          market: z.string().describe("Market code (GB, US, etc.)"),
        },
      },
      async ({ market }) => jsonResult(getComplianceInfo(market))
    );
  },
  {
    serverInfo: {
      name: brand.mcpServerName,
      version: "2026-01-11",
    },
  },
  {
    streamableHttpEndpoint: "/api/mcp",
    sseEndpoint: "/api/mcp/sse",
    sseMessageEndpoint: "/api/mcp/message",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === "development",
  }
);
