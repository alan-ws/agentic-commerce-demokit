"use client";

import { Renderer as JsonRenderer, JSONUIProvider } from "@json-render/react";
import { registry } from "./registry";
import type { Spec } from "@json-render/core";

export function Renderer({
  spec,
  loading,
}: {
  spec: Spec;
  loading?: boolean;
}) {
  return (
    <JSONUIProvider registry={registry}>
      <JsonRenderer
        spec={spec}
        registry={registry}
        loading={loading}
        fallback={({ element }) => (
          <div className="rounded border border-dashed p-2 text-sm text-muted-foreground">
            Unknown component: {element.type}
          </div>
        )}
      />
    </JSONUIProvider>
  );
}
