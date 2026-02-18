"use client";

import Link from "next/link";
import { getAllProducts } from "@/lib/commerce/products";
import { Badge } from "@/components/ui/badge";

const currencySymbol: Record<string, string> = {
  GBP: "\u00A3",
  USD: "$",
  EUR: "\u20AC",
};

export function ProductGrid() {
  const products = getAllProducts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/widget/products/${product.id}`}
          className="group block rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
          />
          <div className="p-3 space-y-1.5">
            <h3 className="text-sm font-semibold leading-tight line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs capitalize">
                {product.category.replace("-", " ")}
              </Badge>
              <span className="text-sm font-bold">
                {currencySymbol["GBP"]}
                {product.price["GBP"]}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
