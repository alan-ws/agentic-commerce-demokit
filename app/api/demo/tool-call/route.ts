import { NextResponse } from "next/server";
import { searchProducts, getProductById } from "@/lib/commerce/products";
import { getPurchaseChannels } from "@/lib/commerce/routing";
import {
  buildProductCardSpec,
  buildProductGridSpec,
  buildChannelRouterSpec,
} from "@/lib/mcp-widgets/spec-builders";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export async function POST(req: Request) {
  const { tool, arguments: args } = await req.json();

  switch (tool) {
    case "get_product": {
      const product = getProductById(args.productId);
      if (!product)
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      const spec = buildProductCardSpec(product, BASE_URL);
      return NextResponse.json({ spec, data: product });
    }
    case "search_products": {
      const results = searchProducts(args);
      const spec = buildProductGridSpec(results, BASE_URL);
      return NextResponse.json({
        spec,
        data: { products: results, count: results.length },
      });
    }
    case "get_purchase_channels": {
      const channels = getPurchaseChannels(args.productId, args.market);
      const product = getProductById(args.productId);
      const channelData = {
        productId: args.productId,
        productName: product?.name ?? args.productId,
        channels,
      };
      const spec = buildChannelRouterSpec(channelData);
      return NextResponse.json({
        spec,
        data: { ...channelData, market: args.market },
      });
    }
    default:
      return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
  }
}
