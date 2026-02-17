"use client";

import { useState, useEffect, useCallback } from "react";
import { wizardSteps } from "@/config/conversation";
import { WizardProgress } from "./wizard-progress";
import { WizardRenderer } from "@/lib/render/wizard-renderer";
import { Renderer } from "@/lib/render/renderer";
import { buildStepSpec } from "@/lib/render/build-step-spec";
import { searchProductsAction } from "@/lib/actions/search-products";
import { ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Spec } from "@json-render/core";

type Selections = Record<string, string>;

export function DiscoveryWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [results, setResults] = useState<Spec | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSelect = useCallback(
    (stepId: string, value: string) => {
      setSelections((prev) => ({ ...prev, [stepId]: value }));

      // Auto-advance after brief delay
      setTimeout(() => {
        if (currentStep < wizardSteps.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          // Last step completed — trigger search
          setIsSearching(true);
        }
      }, 300);
    },
    [currentStep]
  );

  // Listen for wizard-select CustomEvent
  useEffect(() => {
    const handler = (e: Event) => {
      const { stepId, value } = (e as CustomEvent).detail;
      handleSelect(stepId, value);
    };
    window.addEventListener("wizard-select", handler);
    return () => window.removeEventListener("wizard-select", handler);
  }, [handleSelect]);

  // Trigger search when isSearching becomes true
  useEffect(() => {
    if (!isSearching) return;

    const finalSelections = { ...selections };
    // The last step's selection may not be in state yet due to timing
    // so we capture it from the current state

    searchProductsAction(finalSelections)
      .then((resultSpec) => {
        setResults(resultSpec);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, [isSearching, selections]);

  const handleBack = () => {
    if (results) {
      setResults(null);
      setCurrentStep(wizardSteps.length - 1);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setSelections({});
    setResults(null);
    setIsSearching(false);
  };

  const step = wizardSteps[currentStep];
  const showResults = results !== null;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <WizardProgress currentStep={showResults ? wizardSteps.length : currentStep} />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={currentStep === 0 && !showResults}
          className="gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {(currentStep > 0 || showResults) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartOver}
            className="gap-1.5 text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
        )}
      </div>

      {/* Content */}
      {isSearching ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
          <p className="text-muted-foreground">Finding your perfect spirit...</p>
        </div>
      ) : showResults ? (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-[#1B365D]">
              Your Recommendations
            </h2>
            <p className="text-muted-foreground">
              Based on your selections, we think you&apos;ll love these
            </p>
          </div>
          <Renderer spec={results} />
        </div>
      ) : (
        <WizardRenderer spec={buildStepSpec(step, selections[step.id] ?? null)} />
      )}
    </div>
  );
}
