/**
 * UCP Discovery Profile Generator — spec version 2026-01-11
 * Grounded in: .ucp-spec/source/discovery/profile_schema.json
 *
 * Business profile served at /.well-known/ucp
 */

import { ucpConfig } from "@/lib/ucp/config";

export function generateProfile(baseUrl: string) {
  const version = ucpConfig.ucp_version;

  // Build service bindings (one per transport)
  const services: Record<string, unknown[]> = {
    "dev.ucp.shopping": ucpConfig.transports.map((transport) => ({
      version,
      transport,
      endpoint:
        transport === "rest"
          ? `${baseUrl}/api/ucp`
          : `${baseUrl}/api/mcp`,
    })),
  };

  // Build capability declarations
  const capabilities: Record<string, unknown[]> = {};

  capabilities["dev.ucp.shopping.checkout"] = [{ version }];

  for (const ext of ucpConfig.capabilities.extensions) {
    if (ext === "dev.ucp.shopping.buyer_consent") {
      capabilities[ext] = [
        {
          version,
          extends: "dev.ucp.shopping.checkout",
        },
      ];
    } else {
      capabilities[ext] = [{ version }];
    }
  }

  // Payment handlers (empty for DemoKit mock)
  const payment_handlers: Record<string, unknown[]> = {};

  return {
    ucp: {
      version,
      services,
      capabilities,
      payment_handlers,
    },
  };
}
