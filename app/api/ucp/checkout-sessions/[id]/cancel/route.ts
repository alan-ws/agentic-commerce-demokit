/**
 * UCP Cancel Checkout — POST /api/ucp/checkout-sessions/:id/cancel
 * Spec: .ucp-spec/source/services/shopping/rest.openapi.json → cancel_checkout
 */

import { NextRequest } from "next/server";
import { cancelCheckout } from "@/lib/ucp/handlers/checkout";
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

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

    const session = await cancelCheckout(id, {
      capabilities: negotiation.capabilities,
      baseUrl,
    });

    if (!session) {
      return ucpError(404, "checkout_not_found", `Checkout session ${id} not found`);
    }

    return ucpResponse(session, negotiation);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Cancel failed";
    return ucpError(409, "checkout_cancel_failed", msg);
  }
}
