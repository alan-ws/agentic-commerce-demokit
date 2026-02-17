/**
 * UCP Configuration — loaded from ucp.config.json
 * Re-exported as typed module to avoid JSON import resolution issues.
 */

export const ucpConfig = {
  ucp_version: "2026-01-11",
  roles: ["business"] as const,
  runtime: "nodejs" as const,
  capabilities: {
    core: ["dev.ucp.shopping.checkout"],
    extensions: ["dev.ucp.shopping.buyer_consent"],
  },
  transports: ["rest", "mcp"] as const,
  payment_handlers: [] as string[],
  domain: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  policy_urls: {
    privacy: "https://www.diageo.com/privacy-policy",
    terms: "https://www.diageo.com/terms-of-use",
    refunds: "",
    shipping: "",
  },
};
