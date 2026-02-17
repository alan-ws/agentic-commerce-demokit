/**
 * Dynamic product image generator — serves branded SVG placeholders.
 * GET /products/:id.jpg (or any extension — always returns SVG)
 *
 * Generates a category-colored card with product initials.
 * No external dependencies, instant, looks intentional for a DemoKit.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/commerce/products";

const categoryColors: Record<string, { bg: string; accent: string }> = {
  scotch: { bg: "#2C1810", accent: "#C8A951" },
  "irish-whiskey": { bg: "#1A3320", accent: "#D4A843" },
  vodka: { bg: "#E8E8E8", accent: "#1B365D" },
  gin: { bg: "#0D3B2E", accent: "#A8D5BA" },
  tequila: { bg: "#3D2B1F", accent: "#E8C547" },
  rum: { bg: "#4A1C1C", accent: "#D4914E" },
  beer: { bg: "#1A1A1A", accent: "#F5E6C8" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 0 && w[0] === w[0].toUpperCase())
    .map((w) => w[0])
    .slice(0, 3)
    .join("");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Strip file extension if present (e.g., "jw-black.jpg" → "jw-black")
  const productId = id.replace(/\.\w+$/, "");
  const product = getProductById(productId);

  const name = product?.name ?? productId;
  const category = product?.category ?? "scotch";
  const colors = categoryColors[category] ?? categoryColors.scotch;
  const initials = getInitials(name);
  const abv = product?.abv ? `${product.abv}% ABV` : "";
  const volume = product?.volume ?? "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.bg};stop-opacity:0.85" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="0"/>
  <rect x="20" y="20" width="360" height="360" rx="8" fill="none" stroke="${colors.accent}" stroke-width="1" opacity="0.3"/>
  <text x="200" y="175" text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="${colors.accent}">${initials}</text>
  <text x="200" y="225" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="${colors.accent}" opacity="0.7">${escapeXml(name)}</text>
  <line x1="160" y1="250" x2="240" y2="250" stroke="${colors.accent}" stroke-width="1" opacity="0.3"/>
  <text x="200" y="280" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="${colors.accent}" opacity="0.5">${volume}${volume && abv ? " · " : ""}${abv}</text>
  <text x="200" y="360" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" letter-spacing="2" fill="${colors.accent}" opacity="0.4">${escapeXml(category.toUpperCase().replace("-", " "))}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
