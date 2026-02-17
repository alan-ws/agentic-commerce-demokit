"use client";

import { defineRegistry } from "@json-render/react";
import { wizardCatalog } from "./wizard-catalog";
import { OptionGrid } from "@/components/interactive/option-grid";

export const { registry: wizardRegistry } = defineRegistry(wizardCatalog, {
  components: {
    OptionGrid: ({ props }) => (
      <OptionGrid
        {...props}
        onSelect={(value) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("wizard-select", {
                detail: { stepId: props.stepId, value },
              })
            );
          }
        }}
      />
    ),
  },
  actions: {
    select_option: async (params) => {
      if (typeof window !== "undefined" && params) {
        window.dispatchEvent(
          new CustomEvent("wizard-select", { detail: params })
        );
      }
    },
  },
});
