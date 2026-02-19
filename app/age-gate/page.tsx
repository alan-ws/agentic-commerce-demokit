"use client";

import { AgeGateForm } from "@/components/commerce/age-gate-form";
import { brand } from "@/config/brand";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";

export default function AgeGatePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-foreground text-background mx-auto mb-4">
          <Bot className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{brand.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{brand.tagline}</p>
      </div>
      <AgeGateForm
        market="GB"
        requiredAge={18}
        onVerified={(verified) => {
          if (verified) {
            router.push("/");
          }
        }}
      />
      <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs">
        By entering this site you agree to our Terms of Use and Privacy Policy.
        Please drink responsibly.
      </p>
    </div>
  );
}
