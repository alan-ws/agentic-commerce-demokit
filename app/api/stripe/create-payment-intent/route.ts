/**
 * POST /api/stripe/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for a checkout session.
 * Called by the checkout form (browser) to get a client_secret for Stripe Elements.
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCheckout } from "@/lib/ucp/handlers/checkout";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { checkout_id } = await request.json();

    if (!checkout_id) {
      return NextResponse.json(
        { error: "checkout_id is required" },
        { status: 400 }
      );
    }

    const session = await getCheckout(checkout_id);
    if (!session) {
      return NextResponse.json(
        { error: "Checkout session not found" },
        { status: 404 }
      );
    }

    if (session.status === "completed" || session.status === "canceled") {
      return NextResponse.json(
        { error: `Checkout is ${session.status}` },
        { status: 409 }
      );
    }

    const total = session.totals.find((t) => t.type === "total");
    if (!total || total.amount <= 0) {
      return NextResponse.json(
        { error: "Invalid checkout total" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total.amount,
      currency: session.currency.toLowerCase(),
      metadata: {
        checkout_id: session.id,
        market: session.market,
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create PaymentIntent";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
