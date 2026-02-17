import routingRulesData from "@/config/routing-rules.json";
import { getProductById } from "./products";

interface RoutingChannel {
  type: "d2c" | "retailer";
  name: string;
  url: string;
  priority: number;
}

interface RoutingRule {
  match: { market?: string; category?: string };
  channels: RoutingChannel[];
}

interface RoutingRules {
  defaultChannel: string;
  rules: RoutingRule[];
}

const routingRules = routingRulesData as RoutingRules;

export interface PurchaseChannel {
  type: "d2c" | "retailer";
  name: string;
  url: string;
  priority: number;
}

export function getPurchaseChannels(
  productId: string,
  market: string
): PurchaseChannel[] {
  const product = getProductById(productId);
  if (!product) return [];

  // Find matching rules — more specific rules first
  const matchingRules = routingRules.rules.filter((rule) => {
    const marketMatch = !rule.match.market || rule.match.market === market;
    const categoryMatch =
      !rule.match.category || rule.match.category === product.category;
    return marketMatch && categoryMatch;
  });

  // Sort by specificity: rules with both market+category first, then market-only, then category-only
  matchingRules.sort((a, b) => {
    const scoreA = (a.match.market ? 2 : 0) + (a.match.category ? 1 : 0);
    const scoreB = (b.match.market ? 2 : 0) + (b.match.category ? 1 : 0);
    return scoreB - scoreA;
  });

  // Use the most specific rule
  const bestRule = matchingRules[0];
  if (!bestRule) return [];

  // Replace template variables in URLs
  const productSlug = product.id;
  const productName = encodeURIComponent(product.name);

  return bestRule.channels
    .map((ch) => ({
      type: ch.type,
      name: ch.name,
      url: ch.url
        .replace("{productSlug}", productSlug)
        .replace("{productName}", productName),
      priority: ch.priority,
    }))
    .sort((a, b) => a.priority - b.priority);
}
