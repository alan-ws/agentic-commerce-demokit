"use client";

import { Renderer as JsonRenderer, JSONUIProvider } from "@json-render/react";
import { wizardRegistry } from "./wizard-registry";
import type { Spec } from "@json-render/core";

export function WizardRenderer({ spec }: { spec: Spec }) {
  return (
    <JSONUIProvider registry={wizardRegistry}>
      <JsonRenderer
        spec={spec}
        registry={wizardRegistry}
        fallback={({ element }) => (
          <div className="rounded border border-dashed p-2 text-sm text-muted-foreground">
            Unknown component: {element.type}
          </div>
        )}
      />
    </JSONUIProvider>
  );
}
