/**
 * UCP Checkout Session — GET, PUT /api/ucp/checkout-sessions/:id
 * Spec: .ucp-spec/source/services/shopping/rest.openapi.json → get_checkout, update_checkout
 */

import { NextRequest } from "next/server";
import {
  getCheckout,
  updateCheckout,
} from "@/lib/ucp/handlers/checkout";
import { UpdateCheckoutRequestSchema } from "@/lib/ucp/schemas/checkout";
import { negotiateCapabilities, parseUCPAgent } from "@/lib/ucp/negotiation";
import { ucpResponse, ucpError } from "@/lib/ucp/response";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ucpAgent = parseUCPAgent(request.headers.get("UCP-Agent"));
  const negotiation = await negotiateCapabilities(ucpAgent?.profile);

  const session = await getCheckout(id);
  if (!session) {
    return ucpError(404, "checkout_not_found", `Checkout session ${id} not found`);
  }

  return ucpResponse(session, negotiation);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ucpAgent = parseUCPAgent(request.headers.get("UCP-Agent"));
    const negotiation = await negotiateCapabilities(ucpAgent?.profile);

    const body = await request.json();
    const parsed = UpdateCheckoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return ucpError(400, "invalid_request", parsed.error.message);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

    const session = await updateCheckout(id, parsed.data, {
      capabilities: negotiation.capabilities,
      baseUrl,
    });

    if (!session) {
      return ucpError(404, "checkout_not_found", `Checkout session ${id} not found`);
    }

    return ucpResponse(session, negotiation);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Update failed";
    return ucpError(409, "checkout_update_failed", msg);
  }
}
