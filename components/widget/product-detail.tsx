"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/commerce/products";
import { useOptionalWidgetContext } from "./widget-context";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wine, Droplets, Flame } from "lucide-react";

const currencySymbol: Record<string, string> = {
  GBP: "\u00A3",
  USD: "$",
  EUR: "\u20AC",
};

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const ctx = useOptionalWidgetContext();

  // Set current product in widget context on mount, clear on unmount
  useEffect(() => {
    ctx?.setCurrentProduct(product);
    return () => {
      ctx?.setCurrentProduct(null);
    };
    // Only run when product.id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-64 object-cover rounded-lg"
      />

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B365D]">
              {product.name}
            </h1>
            <p className="text-muted-foreground">{product.brand}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold">
              {currencySymbol["GBP"]}
              {product.price["GBP"]}
            </p>
            <p className="text-sm text-muted-foreground">
              {product.volume} &middot; {product.abv}% ABV
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge className="bg-[#1B365D] text-white capitalize">
            {product.category.replace("-", " ")}
          </Badge>
          {product.subcategory && (
            <Badge variant="outline" className="capitalize">
              {product.subcategory}
            </Badge>
          )}
        </div>
      </div>

      <p className="text-sm leading-relaxed">{product.description}</p>

      {product.flavorProfile.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {product.flavorProfile.map((flavor) => (
            <Badge
              key={flavor}
              variant="secondary"
              className="text-xs border-[#C8A951]/30 bg-[#C8A951]/10 text-[#1B365D]"
            >
              {flavor}
            </Badge>
          ))}
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1B365D]">Tasting Notes</h2>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-3">
            <Wine className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A951]" />
            <div>
              <span className="font-medium">Nose:</span>{" "}
              {product.tastingNotes.nose}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A951]" />
            <div>
              <span className="font-medium">Palate:</span>{" "}
              {product.tastingNotes.palate}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Flame className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A951]" />
            <div>
              <span className="font-medium">Finish:</span>{" "}
              {product.tastingNotes.finish}
            </div>
          </div>
        </div>
      </div>

      {product.occasions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[#1B365D]">
              Perfect For
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {product.occasions.map((occasion) => (
                <Badge key={occasion} variant="outline" className="text-xs capitalize">
                  {occasion.replace("-", " ")}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
