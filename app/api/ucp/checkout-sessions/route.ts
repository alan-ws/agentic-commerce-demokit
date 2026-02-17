/**
 * UCP Checkout Sessions — POST /api/ucp/checkout-sessions
 * Spec: .ucp-spec/source/services/shopping/rest.openapi.json → create_checkout
 */

import { NextRequest } from "next/server";
import { createCheckout } from "@/lib/ucp/handlers/checkout";
import { CreateCheckoutRequestSchema } from "@/lib/ucp/schemas/checkout";
import { negotiateCapabilities, parseUCPAgent } from "@/lib/ucp/negotiation";
import { ucpResponse, ucpError } from "@/lib/ucp/response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ucpAgent = parseUCPAgent(request.headers.get("UCP-Agent"));
    const negotiation = await negotiateCapabilities(ucpAgent?.profile);

    const body = await request.json();
    const parsed = CreateCheckoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return ucpError(400, "invalid_request", parsed.error.message);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

    const session = await createCheckout(parsed.data, {
      capabilities: negotiation.capabilities,
      baseUrl,
      idempotencyKey: request.headers.get("Idempotency-Key"),
    });

    return ucpResponse(session, negotiation, 201);
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return ucpError(
      500,
      "internal_error",
      "Failed to create checkout session"
    );
  }
}
