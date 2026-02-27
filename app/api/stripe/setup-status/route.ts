/**
 * GET /api/stripe/setup-status?setup_intent_id=seti_xxx
 *
 * Polls the status of a SetupIntent. Once succeeded, returns
 * the PaymentMethod ID and card details so the gateway can store them.
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const siId = request.nextUrl.searchParams.get("setup_intent_id");
    if (!siId) {
      return NextResponse.json({ error: "setup_intent_id required" }, { status: 400 });
    }

    const si = await stripe.setupIntents.retrieve(siId, {
      expand: ["payment_method"],
    });

    if (si.status === "succeeded" && si.payment_method) {
      const pm = typeof si.payment_method === "string"
        ? await stripe.paymentMethods.retrieve(si.payment_method)
        : si.payment_method;

      return NextResponse.json({
        status: "succeeded",
        customer_id: si.customer as string,
        payment_method_id: pm.id,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
        } : null,
      });
    }

    return NextResponse.json({
      status: si.status, // requires_payment_method, requires_confirmation, processing, etc.
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to check setup status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
