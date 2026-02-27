"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { CheckoutSession } from "@/lib/ucp/types/checkout";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const currencySymbols: Record<string, string> = {
  GBP: "\u00a3",
  USD: "$",
  EUR: "\u20ac",
  JPY: "\u00a5",
};

function formatAmount(amount: number, currency: string) {
  const symbol = currencySymbols[currency] ?? currency + " ";
  if (currency === "JPY") return `${symbol}${amount}`;
  return `${symbol}${(amount / 100).toFixed(2)}`;
}

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return { text: "Completed", variant: "default" as const };
    case "canceled":
      return { text: "Canceled", variant: "secondary" as const };
    case "ready_for_complete":
      return { text: "Ready", variant: "default" as const };
    case "requires_escalation":
      return { text: "Action Required", variant: "destructive" as const };
    default:
      return { text: "Incomplete", variant: "outline" as const };
  }
}

// ── Stripe Payment Form (mounted inside Elements provider) ──

function StripePaymentForm({
  sessionId,
  paymentIntentId,
  session,
  onComplete,
  onError,
}: {
  sessionId: string;
  paymentIntentId: string;
  session: CheckoutSession;
  onComplete: (session: CheckoutSession) => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return;
    setProcessing(true);
    onError("");

    try {
      // Confirm the payment client-side via Stripe Elements
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (stripeError) {
        onError(stripeError.message ?? "Payment failed");
        setProcessing(false);
        return;
      }

      // Payment succeeded — tell the UCP server to complete the checkout
      const completeRes = await fetch(
        `/api/ucp/checkout-sessions/${sessionId}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment: {
              instruments: [
                {
                  id: "stripe-elements",
                  handler_id: "stripe",
                  type: "card",
                  credential: { type: "payment_intent", token: paymentIntentId },
                },
              ],
            },
          }),
        }
      );

      if (!completeRes.ok) {
        const data = await completeRes.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Failed to complete checkout");
      }

      const completed: CheckoutSession = await completeRes.json();
      onComplete(completed);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PaymentElement />
        <div className="flex justify-end">
          <Button onClick={handlePay} disabled={processing || !stripe}>
            {processing
              ? "Processing..."
              : `Pay ${formatAmount(
                  session.totals.find((t) => t.type === "total")?.amount ?? 0,
                  session.currency
                )}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Checkout Form ──

export function CheckoutForm({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    fetch(`/api/ucp/checkout-sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setSession(data);
          setEmail(data.buyer?.email ?? "");
          setFirstName(data.buyer?.first_name ?? "");
          setLastName(data.buyer?.last_name ?? "");
          setPhone(data.buyer?.phone_number ?? "");
          setDob(data.buyer?.consent?.date_of_birth ?? "");
        }
      })
      .catch(() => setError("Failed to load checkout session"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Create PaymentIntent when ready for payment
  const createPaymentIntent = useCallback(async () => {
    if (clientSecret) return; // already created
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkout_id: sessionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to create payment");
      }
      const { client_secret, payment_intent_id } = await res.json();
      setClientSecret(client_secret);
      setPaymentIntentId(payment_intent_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment setup failed");
    }
  }, [sessionId, clientSecret]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <div className="text-center py-20 space-y-2">
        <h2 className="text-2xl font-semibold">Session Not Found</h2>
        <p className="text-muted-foreground">
          This checkout session doesn&apos;t exist or has expired.
        </p>
      </div>
    );
  }

  const expired =
    session.expires_at &&
    new Date(session.expires_at) < new Date() &&
    session.status !== "completed" &&
    session.status !== "canceled";

  if (expired) {
    return (
      <div className="text-center py-20 space-y-2">
        <h2 className="text-2xl font-semibold">Session Expired</h2>
        <p className="text-muted-foreground">
          This checkout session has expired. Please start a new order.
        </p>
      </div>
    );
  }

  const needsAgeVerification = session.messages?.some(
    (m) =>
      m.type === "error" &&
      "code" in m &&
      (m.code === "age_verification_required" ||
        m.code === "age_verification_failed")
  );

  const isTerminal =
    session.status === "completed" || session.status === "canceled";

  const hasStripe = !!stripePromise;

  async function handleUpdateBuyer() {
    setSubmitting(true);
    setError(null);

    try {
      const updateRes = await fetch(
        `/api/ucp/checkout-sessions/${sessionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyer: {
              email,
              first_name: firstName,
              last_name: lastName,
              phone_number: phone || undefined,
              consent: dob ? { date_of_birth: dob } : undefined,
            },
          }),
        }
      );

      if (!updateRes.ok) {
        const data = await updateRes.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Failed to update checkout");
      }

      const updated: CheckoutSession = await updateRes.json();
      setSession(updated);

      if (updated.status !== "ready_for_complete") {
        return;
      }

      // Session is ready — if Stripe is configured, show payment form
      if (hasStripe) {
        await createPaymentIntent();
        setShowPayment(true);
      } else {
        // No Stripe keys — fall back to mock complete
        const completeRes = await fetch(
          `/api/ucp/checkout-sessions/${sessionId}/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        if (!completeRes.ok) {
          const data = await completeRes.json().catch(() => null);
          throw new Error(
            data?.error?.message ?? "Failed to complete checkout"
          );
        }

        const completed: CheckoutSession = await completeRes.json();
        setSession(completed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ucp/checkout-sessions/${sessionId}/cancel`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Failed to cancel checkout");
      }

      const canceled: CheckoutSession = await res.json();
      setSession(canceled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Completed state ---
  if (session.status === "completed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Order Confirmed
            <Badge>Completed</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session.order && (
            <div className="rounded-md border p-4 text-center space-y-1">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="text-lg font-mono font-semibold">
                {session.order.id}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {session.line_items.map((li) => (
              <div key={li.id} className="flex justify-between text-sm">
                <span>
                  {li.item.title ?? li.item.id} x {li.quantity}
                </span>
                <span>
                  {formatAmount(
                    li.totals?.find((t) => t.type === "subtotal")?.amount ?? 0,
                    session.currency
                  )}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1">
              {session.totals.map((t) => (
                <div
                  key={t.type}
                  className={`flex justify-between text-sm ${
                    t.type === "total" ? "font-semibold text-base" : ""
                  }`}
                >
                  <span>{t.display_text ?? t.type}</span>
                  <span>{formatAmount(t.amount, session.currency)}</span>
                </div>
              ))}
            </div>
          </div>
          {session.messages?.map((m, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {m.content}
            </p>
          ))}
        </CardContent>
      </Card>
    );
  }

  // --- Canceled state ---
  if (session.status === "canceled") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Checkout Canceled
            <Badge variant="secondary">Canceled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This checkout has been canceled. You can start a new order anytime.
          </p>
        </CardContent>
      </Card>
    );
  }

  // --- Active checkout form ---
  const status = statusBadge(session.status);

  return (
    <div className="space-y-6">
      {/* Messages */}
      {session.messages && session.messages.length > 0 && (
        <div className="space-y-2">
          {session.messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-md border px-4 py-3 text-sm ${
                m.type === "error"
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : m.type === "warning"
                    ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                    : "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400"
              }`}
            >
              {m.content}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Summary</span>
            <Badge variant={status.variant}>{status.text}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {session.line_items.map((li) => (
            <div key={li.id} className="flex items-center gap-3">
              {li.item.image_url && (
                <img
                  src={li.item.image_url}
                  alt={li.item.title ?? li.item.id}
                  className="h-12 w-12 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {li.item.title ?? li.item.id}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty: {li.quantity}
                  {li.item.price != null && (
                    <>
                      {" "}
                      &middot; {formatAmount(li.item.price, session.currency)}{" "}
                      each
                    </>
                  )}
                </p>
              </div>
              <p className="text-sm font-medium">
                {formatAmount(
                  li.totals?.find((t) => t.type === "subtotal")?.amount ?? 0,
                  session.currency
                )}
              </p>
            </div>
          ))}
          <div className="border-t pt-3 space-y-1">
            {session.totals.map((t) => (
              <div
                key={t.type}
                className={`flex justify-between text-sm ${
                  t.type === "total"
                    ? "font-semibold text-base pt-1 border-t"
                    : ""
                }`}
              >
                <span>{t.display_text ?? t.type}</span>
                <span>{formatAmount(t.amount, session.currency)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Buyer Info */}
      {!showPayment && (
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isTerminal}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isTerminal}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isTerminal}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+44 7700 900000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isTerminal}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Age Verification */}
      {needsAgeVerification && !showPayment && (
        <Card>
          <CardHeader>
            <CardTitle>Age Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={isTerminal}
              />
              <p className="text-xs text-muted-foreground">
                Required for alcohol purchases. You must meet the legal drinking
                age in your market.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Payment */}
      {showPayment && clientSecret && stripePromise && paymentIntentId && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <StripePaymentForm
            sessionId={sessionId}
            paymentIntentId={paymentIntentId}
            session={session}
            onComplete={(completed) => setSession(completed)}
            onError={(msg) => setError(msg || null)}
          />
        </Elements>
      )}

      {/* Actions */}
      {!showPayment && (
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateBuyer}
            disabled={submitting || !email}
          >
            {submitting
              ? "Processing..."
              : hasStripe
                ? "Continue to Payment"
                : "Complete Order"}
          </Button>
        </div>
      )}

      {showPayment && (
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={() => {
              setShowPayment(false);
              setError(null);
            }}
          >
            Back to Details
          </Button>
        </div>
      )}
    </div>
  );
}
