"use client";

import { useMemo } from "react";
import { nestedToFlat } from "@json-render/core";
import { getAllProducts } from "@/lib/commerce/products";
import { Renderer } from "@/lib/render/renderer";
import { Sparkles } from "lucide-react";

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function PickedForYou() {
  const spec = useMemo(() => {
    const products = pickRandom(getAllProducts(), 3);
    return nestedToFlat({
      type: "ProductCarousel",
      props: {
        products: products.map((p) => ({
          productId: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price["GBP"] ?? 0,
          currency: "GBP",
          image: p.image,
          description: p.description,
          abv: p.abv,
          volume: p.volume,
          tastingNotes: p.tastingNotes,
          flavorProfile: p.flavorProfile,
        })),
      },
    });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Picked for You</h2>
      </div>
      <Renderer spec={spec} />
    </div>
  );
}
