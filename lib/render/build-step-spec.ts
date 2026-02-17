import type { Spec } from "@json-render/core";
import type { WizardStep } from "@/config/conversation";

export function buildStepSpec(
  step: WizardStep,
  selectedValue: string | null
): Spec {
  return {
    root: "grid",
    elements: {
      grid: {
        type: "OptionGrid",
        props: {
          stepId: step.id,
          prompt: step.prompt,
          description: step.description,
          options: step.options.map((o) => ({
            value: o.value,
            label: o.label,
            icon: o.icon,
            description: o.description,
          })),
          selected: selectedValue,
        },
        on: {
          select: {
            action: "select_option",
            params: { stepId: step.id, value: "{{value}}" },
          },
        },
      },
    },
  };
}
