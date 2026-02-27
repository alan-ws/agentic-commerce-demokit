/**
 * UCP Checkout Types — spec version 2026-01-11
 * Grounded in: .ucp-spec/source/schemas/shopping/checkout.json
 */

export type CheckoutStatus =
  | "incomplete"
  | "requires_escalation"
  | "ready_for_complete"
  | "complete_in_progress"
  | "completed"
  | "canceled";

export type MessageSeverity =
  | "recoverable"
  | "requires_buyer_input"
  | "requires_buyer_review";

export type TotalType =
  | "items_discount"
  | "subtotal"
  | "discount"
  | "fulfillment"
  | "tax"
  | "fee"
  | "total";

// --- UCP Metadata (in every response) ---

export interface UCPCapabilityRef {
  version: string;
}

export interface UCPServiceRef {
  version: string;
  transport: "rest" | "mcp" | "a2a" | "embedded";
  endpoint?: string;
}

export interface UCPPaymentHandlerRef {
  version: string;
  config?: Record<string, unknown>;
}

export interface UCPResponseMetadata {
  version: string;
  capabilities?: Record<string, UCPCapabilityRef[]>;
  payment_handlers?: Record<string, UCPPaymentHandlerRef[]>;
}

// --- Line item types ---

export interface Item {
  id: string;
  title?: string; // response only
  price?: number; // response only, minor units
  image_url?: string; // response only
}

export interface Total {
  type: TotalType;
  display_text?: string;
  amount: number; // minor units (cents)
}

export interface LineItem {
  id?: string; // omit on create
  item: Item;
  quantity: number;
  totals?: Total[]; // response only
  parent_id?: string;
}

// --- Buyer ---

export interface BuyerConsent {
  analytics?: boolean;
  preferences?: boolean;
  marketing?: boolean;
  sale_of_data?: boolean;
  date_of_birth?: string;   // ISO date input from buyer
  age_verified?: boolean;    // computed by server after DOB validation
}

export interface Buyer {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  consent?: BuyerConsent; // buyer_consent extension
}

// --- Context (request-only, signals for currency/locale) ---

export interface CheckoutContext {
  geo?: { country?: string; region?: string };
  locale?: string;
}

// --- Messages ---

export interface CheckoutMessageError {
  type: "error";
  code: string;
  content: string;
  content_type?: "plain" | "markdown";
  severity: MessageSeverity;
  path?: string;
}

export interface CheckoutMessageWarning {
  type: "warning";
  code?: string;
  content: string;
  content_type?: "plain" | "markdown";
  path?: string;
}

export interface CheckoutMessageInfo {
  type: "info";
  content: string;
  content_type?: "plain" | "markdown";
}

export type CheckoutMessage =
  | CheckoutMessageError
  | CheckoutMessageWarning
  | CheckoutMessageInfo;

// --- Links ---

export interface CheckoutLink {
  type: string; // privacy_policy, terms_of_service, refund_policy, etc.
  url: string;
  title?: string;
}

// --- Payment ---

export interface PaymentInstrument {
  id: string;
  handler_id: string;
  type: "card" | "wallet" | "mandate";
  selected?: boolean;
  display?: { brand?: string; last_digits?: string };
  credential?: { type: string; token: string; customer_id?: string };
}

export interface Payment {
  instruments?: PaymentInstrument[];
}

// --- Checkout session ---

export interface CheckoutSession {
  ucp: UCPResponseMetadata;
  id: string;
  status: CheckoutStatus;
  currency: string;
  market: string; // internal: resolved from context.geo.country
  line_items: LineItem[];
  totals: Total[];
  buyer?: Buyer;
  payment?: Payment;
  messages?: CheckoutMessage[];
  links: CheckoutLink[];
  continue_url?: string;
  expires_at?: string;
  order?: { id: string; status: string };
}

// --- Request types ---

export interface CreateCheckoutRequest {
  line_items: { item: { id: string }; quantity: number }[];
  buyer?: Buyer;
  context?: CheckoutContext;
}

export interface UpdateCheckoutRequest {
  line_items?: { id?: string; item: { id: string }; quantity: number }[];
  buyer?: Buyer;
  context?: CheckoutContext;
}

export interface CompleteCheckoutRequest {
  payment?: Payment;
  risk_signals?: Record<string, unknown>;
}
