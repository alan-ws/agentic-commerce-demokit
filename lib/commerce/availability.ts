import { getProductById } from "./products";
import { brand } from "@/config/brand";

export interface AvailabilityResult {
  productId: string;
  market: string;
  available: boolean;
  channels: {
    type: "d2c" | "retailer";
    name: string;
    inStock: boolean;
    price?: number;
    currency?: string;
  }[];
}

const marketToCurrency: Record<string, string> = {
  GB: "GBP",
  US: "USD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  JP: "USD",
  default: "USD",
};

export function checkAvailability(
  productId: string,
  market: string
): AvailabilityResult {
  const product = getProductById(productId);

  if (!product) {
    return { productId, market, available: false, channels: [] };
  }

  const currency = marketToCurrency[market] ?? marketToCurrency.default;
  const price = product.price[currency] ?? product.price["USD"];

  // Mock availability — most products available, some variation by market
  const seed = simpleHash(productId + market);
  const isAvailable = seed % 10 > 1; // 80% availability

  const channels = [];

  if (isAvailable) {
    // D2C available for premium products in GB
    if (market === "GB" && price > 30) {
      channels.push({
        type: "d2c" as const,
        name: `${brand.name} Direct`,
        inStock: seed % 3 !== 0,
        price,
        currency,
      });
    }

    // Primary retailer always in stock
    channels.push({
      type: "retailer" as const,
      name: market === "US" ? "Drizly" : "Amazon",
      inStock: true,
      price: Math.round(price * 1.05), // slight markup
      currency,
    });

    // Secondary retailer sometimes out of stock
    channels.push({
      type: "retailer" as const,
      name: market === "US" ? "Total Wine" : "Tesco",
      inStock: seed % 4 !== 0,
      price: Math.round(price * 0.98),
      currency,
    });
  }

  return {
    productId,
    market,
    available: isAvailable,
    channels,
  };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
