import oegaidProducts from "@/config/products/oegaid.json";
import meridianProducts from "@/config/products/meridian.json";
import solaraProducts from "@/config/products/solara.json";

const brandKey = process.env.BRAND_KEY ?? "oegaid";

export interface TastingNotes {
  nose: string;
  palate: string;
  finish: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category:
    | "scotch"
    | "irish-whiskey"
    | "vodka"
    | "gin"
    | "tequila"
    | "rum"
    | "beer";
  subcategory?: string;
  description: string;
  tastingNotes: TastingNotes;
  abv: number;
  volume: string;
  price: Record<string, number>;
  image: string;
  occasions: string[];
  flavorProfile: string[];
}

const productMap: Record<string, unknown[]> = {
  oegaid: oegaidProducts,
  meridian: meridianProducts,
  solara: solaraProducts,
};

const products: Product[] = (productMap[brandKey] ?? oegaidProducts) as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  occasion?: string;
  flavor?: string;
  minPrice?: number;
  maxPrice?: number;
  market?: string;
}

export function searchProducts(params: ProductSearchParams): Product[] {
  let results = [...products];

  if (params.q) {
    const query = params.q.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
        p.flavorProfile.some((f) => f.toLowerCase().includes(query)) ||
        p.occasions.some((o) => o.toLowerCase().includes(query))
    );
  }

  if (params.category) {
    results = results.filter((p) => p.category === params.category);
  }

  if (params.occasion) {
    results = results.filter((p) => p.occasions.includes(params.occasion!));
  }

  if (params.flavor) {
    const flavors = params.flavor.split(",");
    results = results.filter((p) =>
      flavors.some((f) => p.flavorProfile.includes(f.trim()))
    );
  }

  const currencyKey = marketToCurrency(params.market);

  if (params.minPrice !== undefined) {
    results = results.filter(
      (p) => (p.price[currencyKey] ?? 0) >= params.minPrice!
    );
  }

  if (params.maxPrice !== undefined) {
    results = results.filter(
      (p) => (p.price[currencyKey] ?? Infinity) <= params.maxPrice!
    );
  }

  return results;
}

export function compareProducts(productIds: string[]): Product[] {
  return productIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== undefined);
}

function marketToCurrency(market?: string): string {
  const map: Record<string, string> = {
    GB: "GBP",
    US: "USD",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    JP: "USD",
    default: "USD",
  };
  return map[market ?? "default"] ?? "USD";
}
