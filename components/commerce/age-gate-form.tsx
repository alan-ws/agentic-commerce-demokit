"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface AgeGateFormProps {
  market: string;
  requiredAge: number;
  onVerified?: (verified: boolean) => void;
}

export function AgeGateForm({
  market,
  requiredAge,
  onVerified,
}: AgeGateFormProps) {
  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dob) {
      setError("Please enter your date of birth");
      return;
    }

    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }

    if (age >= requiredAge) {
      setVerified(true);
      // Set cookie for middleware
      document.cookie = `age-verified=true; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      document.cookie = `user-market=${market}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      onVerified?.(true);
    } else {
      setError(
        `You must be at least ${requiredAge} years old to access this site in ${market}.`
      );
      onVerified?.(false);
    }
  };

  if (verified) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="flex flex-col items-center gap-3 pt-6">
          <ShieldCheck className="h-10 w-10 text-green-600" />
          <p className="font-medium">Age verified. Welcome!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <CardTitle>Age Verification</CardTitle>
        <CardDescription>
          You must be at least {requiredAge} years old to enter this site
          {market ? ` in ${market}` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full">
            Verify Age
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
