"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wine, Droplets, Flame } from "lucide-react";

interface ProductCardProps {
  productId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  image?: string | null;
  description: string;
  abv: number;
  volume: string;
  tastingNotes?: {
    nose: string;
    palate: string;
    finish: string;
  } | null;
  flavorProfile?: string[] | null;
  onNavigate?: (productId: string) => void;
}

const currencySymbol: Record<string, string> = {
  GBP: "\u00A3",
  USD: "$",
  EUR: "\u20AC",
};

export function ProductCard({
  productId,
  name,
  brand,
  category,
  price,
  currency,
  image,
  description,
  abv,
  volume,
  tastingNotes,
  flavorProfile,
  onNavigate,
}: ProductCardProps) {
  const symbol = currencySymbol[currency] ?? currency;
  const imageUrl = image ?? `/products/${productId}.jpg`;

  return (
    <Card
      className={`w-full max-w-md overflow-hidden${onNavigate ? " cursor-pointer transition-shadow hover:shadow-lg hover:ring-1 hover:ring-ring" : ""}`}
      onClick={onNavigate ? () => onNavigate(productId) : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-48 object-cover"
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>
              {brand} &middot; {category}
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold">
              {symbol}
              {price}
            </p>
            <p className="text-xs text-muted-foreground">
              {volume} &middot; {abv}% ABV
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>

        {flavorProfile && flavorProfile.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {flavorProfile.map((flavor) => (
              <Badge key={flavor} variant="secondary" className="text-xs">
                {flavor}
              </Badge>
            ))}
          </div>
        )}

        {tastingNotes && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Wine className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">Nose:</span>{" "}
                  {tastingNotes.nose}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">Palate:</span>{" "}
                  {tastingNotes.palate}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Flame className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">Finish:</span>{" "}
                  {tastingNotes.finish}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
