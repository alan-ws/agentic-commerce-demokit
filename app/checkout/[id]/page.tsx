import { brand } from "@/config/brand";
import { CheckoutForm } from "@/components/checkout-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Checkout — ${brand.name}`,
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-4">
          <h1 className="text-lg font-semibold">{brand.name}</h1>
          <span className="text-muted-foreground text-sm">Checkout</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CheckoutForm sessionId={id} />
      </main>
    </div>
  );
}
