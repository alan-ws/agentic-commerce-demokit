"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function SetupForm({ onComplete }: { onComplete: (pm: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Setup failed");
      setProcessing(false);
      return;
    }

    if (setupIntent?.status === "succeeded") {
      onComplete(setupIntent.payment_method as string);
    } else {
      setError(`Unexpected status: ${setupIntent?.status}`);
    }

    setProcessing(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {processing ? "Saving..." : "Save Card"}
      </button>
    </form>
  );
}

export default function WalletSetupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading wallet setup...</p>
      </div>
    }>
      <WalletSetupInner />
    </Suspense>
  );
}

function WalletSetupInner() {
  const params = useSearchParams();
  const clientSecret = params.get("secret");
  const customerId = params.get("cus");
  const setupIntentId = params.get("si");

  const [done, setDone] = useState(false);
  const [pmId, setPmId] = useState<string | null>(null);
  const [cardInfo, setCardInfo] = useState<{
    brand: string;
    last4: string;
  } | null>(null);

  // After setup completes, fetch card details for display
  useEffect(() => {
    if (!done || !setupIntentId) return;
    fetch(`/api/stripe/setup-status?setup_intent_id=${setupIntentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.card) {
          setCardInfo(data.card);
        }
      })
      .catch(() => {});
  }, [done, setupIntentId]);

  if (!clientSecret || !stripePromise) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Wallet Setup</h1>
          <p className="text-gray-500">
            {!stripePromise
              ? "Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local"
              : "Missing setup parameters. This page should be opened from the UCP Gateway."}
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Card Saved</h1>
          {cardInfo && (
            <p className="text-gray-600">
              {cardInfo.brand.charAt(0).toUpperCase() + cardInfo.brand.slice(1)} ending in {cardInfo.last4}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Your card has been securely saved. The UCP Gateway will pick it up automatically.
            You can close this tab.
          </p>
          {pmId && (
            <div className="rounded-md border bg-gray-50 px-4 py-3 text-left">
              <p className="text-xs text-gray-400">Payment Method</p>
              <p className="font-mono text-sm">{pmId}</p>
              <p className="text-xs text-gray-400 mt-1">Customer</p>
              <p className="font-mono text-sm">{customerId}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Save a Payment Method</h1>
          <p className="mt-2 text-sm text-gray-500">
            This card will be saved to your UCP wallet for future agentic purchases.
            3D Secure verification may be required.
          </p>
        </div>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <SetupForm
            onComplete={(pm) => {
              setPmId(pm);
              setDone(true);
            }}
          />
        </Elements>
        <p className="text-center text-xs text-gray-400">
          Powered by Stripe. Card details are never stored on this server.
        </p>
      </div>
    </div>
  );
}
