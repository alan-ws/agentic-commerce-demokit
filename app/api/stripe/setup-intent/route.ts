/**
 * POST /api/stripe/setup-intent
 *
 * Creates a Stripe Customer + SetupIntent for saving a card.
 * The browser uses the client_secret to mount Stripe Elements.
 * After confirmation, the PaymentMethod (pm_xxx) is attached to the Customer (cus_xxx).
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Create or reuse customer
    let customerId = body.customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: body.email || undefined,
        name: body.name || undefined,
        metadata: { source: "ucp-gateway" },
      });
      customerId = customer.id;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { source: "ucp-gateway" },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

    return NextResponse.json({
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id,
      customer_id: customerId,
      setup_url: `${baseUrl}/wallet/setup?si=${setupIntent.id}&cus=${customerId}&secret=${setupIntent.client_secret}`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create SetupIntent";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
