/**
 * UCP Configuration — loaded from brand config
 * Re-exported as typed module to avoid JSON import resolution issues.
 */

import { brand } from "@/config/brand";

export const ucpConfig = {
  ucp_version: "2026-01-11",
  roles: ["business"] as const,
  runtime: "nodejs" as const,
  capabilities: {
    core: ["dev.ucp.shopping.checkout"],
    extensions: ["dev.ucp.shopping.buyer_consent"],
  },
  transports: ["rest", "mcp"] as const,
  payment_handlers: ["stripe", "mock"] as string[],
  domain: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  policy_urls: {
    privacy: brand.policyUrls.privacy,
    terms: brand.policyUrls.terms,
    refunds: brand.policyUrls.refunds,
    shipping: brand.policyUrls.shipping,
  },
};
