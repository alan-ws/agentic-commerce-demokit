/**
 * UCP Complete Checkout — POST /api/ucp/checkout-sessions/:id/complete
 * Spec: .ucp-spec/source/services/shopping/rest.openapi.json → complete_checkout
 */

import { NextRequest } from "next/server";
import { completeCheckout } from "@/lib/ucp/handlers/checkout";
import { CompleteCheckoutRequestSchema } from "@/lib/ucp/schemas/checkout";
import { negotiateCapabilities, parseUCPAgent } from "@/lib/ucp/negotiation";
import { ucpResponse, ucpError } from "@/lib/ucp/response";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ucpAgent = parseUCPAgent(request.headers.get("UCP-Agent"));
    const negotiation = await negotiateCapabilities(ucpAgent?.profile);

    const body = await request.json();
    const parsed = CompleteCheckoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return ucpError(400, "invalid_request", parsed.error.message);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

    const session = await completeCheckout(id, parsed.data, {
      capabilities: negotiation.capabilities,
      baseUrl,
    });

    if (!session) {
      return ucpError(404, "checkout_not_found", `Checkout session ${id} not found`);
    }

    return ucpResponse(session, negotiation);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Completion failed";
    return ucpError(409, "checkout_complete_failed", msg);
  }
}
