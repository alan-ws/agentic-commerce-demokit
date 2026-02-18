"use client";

import { defineRegistry } from "@json-render/react";
import { catalog } from "./catalog";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductCarousel } from "@/components/commerce/product-carousel";
import { ComparisonGrid } from "@/components/commerce/comparison-grid";
import { ChannelRouter } from "@/components/commerce/channel-router";
import { AgeGateForm } from "@/components/commerce/age-gate-form";

function dispatchViewProduct(productId: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("view-product", { detail: { productId } })
    );
  }
}

export const { registry, handlers } = defineRegistry(catalog, {
  components: {
    ProductCard: ({ props }) => (
      <ProductCard {...props} onNavigate={dispatchViewProduct} />
    ),
    ProductCarousel: ({ props }) => (
      <ProductCarousel {...props} onNavigate={dispatchViewProduct} />
    ),
    ComparisonGrid: ({ props }) => <ComparisonGrid {...props} />,
    ChannelRouter: ({ props }) => <ChannelRouter {...props} />,
    AgeGatePrompt: ({ props }) => (
      <AgeGateForm market={props.market} requiredAge={props.requiredAge} />
    ),
  },
  actions: {
    view_product: async (params) => {
      if (typeof window !== "undefined" && params) {
        window.dispatchEvent(
          new CustomEvent("view-product", { detail: params })
        );
      }
    },
    route_to_channel: async (params) => {
      if (typeof window !== "undefined" && params) {
        window.open(params.channelUrl, "_blank", "noopener,noreferrer");
      }
    },
    verify_age: async (params) => {
      if (typeof window !== "undefined" && params) {
        window.dispatchEvent(
          new CustomEvent("verify-age", { detail: params })
        );
      }
    },
  },
});
