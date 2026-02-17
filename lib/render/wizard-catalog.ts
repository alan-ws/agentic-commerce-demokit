import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const wizardCatalog = defineCatalog(schema, {
  components: {
    OptionGrid: {
      props: z.object({
        stepId: z.string(),
        prompt: z.string(),
        description: z.string(),
        options: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
            icon: z.string(),
            description: z.string(),
          })
        ),
        selected: z.string().nullable(),
      }),
      description:
        "A grid of selectable option cards for a wizard step. Displays prompt, description, and clickable option cards with icons.",
    },
  },
  actions: {
    select_option: {
      params: z.object({ stepId: z.string(), value: z.string() }),
      description: "Select an option in the wizard step",
    },
  },
});

export type WizardCatalog = typeof wizardCatalog;
