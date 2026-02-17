"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComparisonProduct {
  productId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  abv: number;
  volume: string;
  flavorProfile?: string[] | null;
}

const currencySymbol: Record<string, string> = {
  GBP: "\u00A3",
  USD: "$",
  EUR: "\u20AC",
};

function Row({
  label,
  products,
  render,
}: {
  label: string;
  products: ComparisonProduct[];
  render: (p: ComparisonProduct) => React.ReactNode;
}) {
  return (
    <tr>
      {[
        <td key="__label" className="py-2 pr-4 font-medium text-muted-foreground">
          {label}
        </td>,
        ...products.map((p) => (
          <td key={p.productId} className="py-2 px-3">
            {render(p)}
          </td>
        )),
      ]}
    </tr>
  );
}

export function ComparisonGrid({
  products,
}: {
  products: ComparisonProduct[];
}) {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Product Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {[
                  <th key="__label" className="pb-2 pr-4 text-left font-medium text-muted-foreground">
                    &nbsp;
                  </th>,
                  ...products.map((p) => (
                    <th key={p.productId} className="pb-2 px-3 text-left font-semibold">
                      {p.name}
                    </th>
                  )),
                ]}
              </tr>
            </thead>
            <tbody className="divide-y">
              <Row label="Brand" products={products} render={(p) => p.brand} />
              <Row label="Category" products={products} render={(p) => p.category} />
              <Row
                label="Price"
                products={products}
                render={(p) => (
                  <span className="font-semibold">
                    {currencySymbol[p.currency] ?? p.currency}
                    {p.price}
                  </span>
                )}
              />
              <Row label="ABV" products={products} render={(p) => `${p.abv}%`} />
              <Row label="Volume" products={products} render={(p) => p.volume} />
              <Row
                label="Flavors"
                products={products}
                render={(p) => (
                  <div className="flex flex-wrap gap-1">
                    {(p.flavorProfile ?? []).map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                )}
              />
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
