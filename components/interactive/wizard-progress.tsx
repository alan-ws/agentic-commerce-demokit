"use client";

import { Check } from "lucide-react";
import { wizardSteps } from "@/config/conversation";

interface WizardProgressProps {
  currentStep: number;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {wizardSteps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Circle */}
            <div
              className={`
                relative flex items-center justify-center h-9 w-9 rounded-full
                text-sm font-semibold transition-all duration-300
                ${
                  isCompleted
                    ? "bg-[#C8A951] text-white"
                    : isCurrent
                      ? "bg-[#1B365D] text-white ring-4 ring-[#1B365D]/20"
                      : "bg-muted text-muted-foreground"
                }
              `}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Connecting line */}
            {index < wizardSteps.length - 1 && (
              <div
                className={`
                  h-0.5 w-12 sm:w-16 transition-colors duration-300
                  ${isCompleted ? "bg-[#C8A951]" : "bg-muted"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
