/**
 * UCP Checkout Handler — spec version 2026-01-11
 * Grounded in: .ucp-spec/source/schemas/shopping/checkout.json
 *
 * Status lifecycle:
 *   incomplete → requires_escalation → ready_for_complete → complete_in_progress → completed
 *   (canceled from any state)
 */

import { randomUUID } from "crypto";
import { getProductById } from "@/lib/commerce/products";
import { getComplianceInfo, verifyAge } from "@/lib/commerce/compliance";
import { ucpConfig } from "@/lib/ucp/config";
import type {
  CheckoutSession,
  CheckoutStatus,
  CreateCheckoutRequest,
  UpdateCheckoutRequest,
  CompleteCheckoutRequest,
  Total,
  LineItem,
  CheckoutMessage,
  CheckoutLink,
  UCPResponseMetadata,
} from "@/lib/ucp/types/checkout";

// In-memory store — appropriate for DemoKit
const store = new Map<string, CheckoutSession>();

const marketToCurrency: Record<string, string> = {
  GB: "GBP",
  US: "USD",
  DE: "EUR",
  FR: "EUR",
  JP: "JPY",
  default: "GBP",
};

function buildUCPMetadata(capabilities: string[]): UCPResponseMetadata {
  const capMap: Record<string, { version: string }[]> = {};
  for (const cap of capabilities) {
    capMap[cap] = [{ version: ucpConfig.ucp_version }];
  }
  return {
    version: ucpConfig.ucp_version,
    capabilities: capMap,
    payment_handlers: {},
  };
}

function buildLinks(baseUrl: string): CheckoutLink[] {
  const links: CheckoutLink[] = [];
  if (ucpConfig.policy_urls.privacy) {
    links.push({ type: "privacy_policy", url: ucpConfig.policy_urls.privacy });
  }
  if (ucpConfig.policy_urls.terms) {
    links.push({
      type: "terms_of_service",
      url: ucpConfig.policy_urls.terms,
    });
  }
  if (ucpConfig.policy_urls.refunds) {
    links.push({ type: "refund_policy", url: ucpConfig.policy_urls.refunds });
  }
  if (ucpConfig.policy_urls.shipping) {
    links.push({
      type: "shipping_policy",
      url: ucpConfig.policy_urls.shipping,
    });
  }
  return links;
}

function resolveLineItems(
  items: { id?: string; item: { id: string }; quantity: number }[],
  currency: string
): LineItem[] {
  return items.map((req, idx) => {
    const product = getProductById(req.item.id);
    const currencyKey = currency === "JPY" ? "USD" : currency;
    const unitPrice = product
      ? Math.round((product.price[currencyKey] ?? product.price["GBP"] ?? 0) * 100)
      : 0;
    const totalPrice = unitPrice * req.quantity;

    return {
      id: req.id ?? `line_${idx}`,
      item: {
        id: req.item.id,
        title: product?.name ?? req.item.id,
        price: unitPrice,
        image_url: product?.image,
      },
      quantity: req.quantity,
      totals: [{ type: "subtotal" as const, amount: totalPrice }],
    };
  });
}

function computeTotals(lineItems: LineItem[]): Total[] {
  const subtotal = lineItems.reduce((sum, li) => {
    const liSubtotal = li.totals?.find((t) => t.type === "subtotal");
    return sum + (liSubtotal?.amount ?? 0);
  }, 0);

  const tax = Math.round(subtotal * 0.08); // 8% demo tax
  const total = subtotal + tax;

  return [
    { type: "subtotal", display_text: "Subtotal", amount: subtotal },
    { type: "tax", display_text: "Tax (8%)", amount: tax },
    { type: "total", display_text: "Total", amount: total },
  ];
}

function determineStatus(
  session: CheckoutSession,
  capabilities: string[]
): CheckoutStatus {
  const messages = generateMessages(session, capabilities);
  session.messages = messages;

  const hasEscalation = messages.some(
    (m) =>
      m.type === "error" &&
      (m.severity === "requires_buyer_input" ||
        m.severity === "requires_buyer_review")
  );

  if (hasEscalation) return "requires_escalation";

  const hasRecoverable = messages.some(
    (m) => m.type === "error" && m.severity === "recoverable"
  );

  if (hasRecoverable) return "incomplete";

  return "ready_for_complete";
}

function generateMessages(
  session: CheckoutSession,
  capabilities: string[]
): CheckoutMessage[] {
  const msgs: CheckoutMessage[] = [];

  if (!session.buyer?.email) {
    msgs.push({
      type: "error",
      code: "missing_field",
      content: "Buyer email is required to complete checkout.",
      severity: "recoverable",
      path: "$.buyer.email",
    });
  }

  // Age verification for alcohol — blocking escalation
  if (capabilities.includes("dev.ucp.shopping.buyer_consent")) {
    const compliance = getComplianceInfo(session.market);

    if (compliance.ageThreshold > 0) {
      if (session.buyer?.consent?.age_verified === true) {
        // Already verified — no message needed
      } else if (session.buyer?.consent?.date_of_birth) {
        const result = verifyAge(session.buyer.consent.date_of_birth, session.market);
        if (result.verified) {
          // Mutate session to mark verified
          if (!session.buyer.consent) session.buyer.consent = {};
          session.buyer.consent.age_verified = true;
        } else {
          msgs.push({
            type: "error",
            code: "age_verification_failed",
            content: `You must be at least ${compliance.ageThreshold} years old to purchase alcohol in ${session.market}.`,
            severity: "requires_buyer_input",
            path: "$.buyer.consent.date_of_birth",
          });
        }
      } else {
        msgs.push({
          type: "error",
          code: "age_verification_required",
          content: `Age verification required (${compliance.ageThreshold}+ in ${session.market}). Provide date_of_birth in buyer.consent.`,
          severity: "requires_buyer_input",
          path: "$.buyer.consent.date_of_birth",
        });
      }
    }
  }

  return msgs;
}

// --- Public API ---

export interface CheckoutOptions {
  capabilities: string[];
  baseUrl: string;
  idempotencyKey?: string | null;
}

export async function createCheckout(
  request: CreateCheckoutRequest,
  options: CheckoutOptions
): Promise<CheckoutSession> {
  const id = randomUUID();
  const market = request.context?.geo?.country ?? "GB";
  const currency = marketToCurrency[market] ?? marketToCurrency.default;
  const lineItems = resolveLineItems(request.line_items, currency);
  const totals = computeTotals(lineItems);

  const session: CheckoutSession = {
    ucp: buildUCPMetadata(options.capabilities),
    id,
    status: "incomplete",
    currency,
    market,
    line_items: lineItems,
    totals,
    buyer: request.buyer,
    payment: { instruments: [] },
    messages: [],
    links: buildLinks(options.baseUrl),
    continue_url: `${options.baseUrl}/checkout/${id}`,
    expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  };

  session.status = determineStatus(session, options.capabilities);
  store.set(id, session);
  return session;
}

export async function getCheckout(
  id: string
): Promise<CheckoutSession | null> {
  return store.get(id) ?? null;
}

export async function updateCheckout(
  id: string,
  request: UpdateCheckoutRequest,
  options: CheckoutOptions
): Promise<CheckoutSession | null> {
  const session = store.get(id);
  if (!session) return null;
  if (session.status === "completed" || session.status === "canceled") {
    throw new Error("Checkout cannot be modified in current state");
  }

  const market = request.context?.geo?.country ?? session.market;
  const currency = marketToCurrency[market] ?? session.currency;
  session.currency = currency;
  session.market = market;

  if (request.line_items) {
    session.line_items = resolveLineItems(request.line_items, currency);
    session.totals = computeTotals(session.line_items);
  }

  if (request.buyer) {
    session.buyer = { ...session.buyer, ...request.buyer };
  }

  session.ucp = buildUCPMetadata(options.capabilities);
  session.status = determineStatus(session, options.capabilities);

  store.set(id, session);
  return session;
}

export async function completeCheckout(
  id: string,
  request: CompleteCheckoutRequest,
  options: CheckoutOptions
): Promise<CheckoutSession | null> {
  const session = store.get(id);
  if (!session) return null;

  if (session.status !== "ready_for_complete") {
    throw new Error(
      `Checkout is not ready for completion (status: ${session.status})`
    );
  }

  // Explicit age verification guard for alcohol markets
  const compliance = getComplianceInfo(session.market);
  if (
    compliance.ageThreshold > 0 &&
    options.capabilities.includes("dev.ucp.shopping.buyer_consent") &&
    session.buyer?.consent?.age_verified !== true
  ) {
    throw new Error(
      `Age verification required (${compliance.ageThreshold}+ in ${session.market}) before completing checkout`
    );
  }

  session.status = "complete_in_progress";
  store.set(id, session);

  // Mock payment processing
  session.status = "completed";
  session.order = {
    id: `order_${randomUUID().slice(0, 8)}`,
    status: "confirmed",
  };
  session.ucp = buildUCPMetadata(options.capabilities);
  session.messages = [
    {
      type: "info",
      content: "Order placed successfully. Thank you for your purchase!",
    },
  ];

  store.set(id, session);
  return session;
}

export async function cancelCheckout(
  id: string,
  options: CheckoutOptions
): Promise<CheckoutSession | null> {
  const session = store.get(id);
  if (!session) return null;
  if (session.status === "completed") {
    throw new Error("Cannot cancel a completed checkout");
  }

  session.status = "canceled";
  session.ucp = buildUCPMetadata(options.capabilities);
  session.messages = [{ type: "info", content: "Checkout session canceled." }];

  store.set(id, session);
  return session;
}
