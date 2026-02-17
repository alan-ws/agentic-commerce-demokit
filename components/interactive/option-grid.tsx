"use client";

import {
  Gift,
  PartyPopper,
  Wine,
  GlassWater,
  UtensilsCrossed,
  Flame,
  Candy,
  FlameKindling,
  Cherry,
  Droplets,
  Zap,
  Coins,
  Banknote,
  Gem,
  Crown,
  Sparkles,
  MapPin,
} from "lucide-react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Gift,
  PartyPopper,
  Wine,
  GlassWater,
  UtensilsCrossed,
  Flame,
  Candy,
  FlameKindling,
  Cherry,
  Droplets,
  Zap,
  Coins,
  Banknote,
  Gem,
  Crown,
  Sparkles,
  MapPin,
};

interface Option {
  value: string;
  label: string;
  icon: string;
  description: string;
}

interface OptionGridProps {
  stepId: string;
  prompt: string;
  description: string;
  options: Option[];
  selected: string | null;
  onSelect?: (value: string) => void;
}

export function OptionGrid({
  prompt,
  description,
  options,
  selected,
  onSelect,
}: OptionGridProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-[#1B365D]">{prompt}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = iconMap[option.icon];
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onSelect?.(option.value)}
              className={`
                group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5
                transition-all duration-200 cursor-pointer text-center
                hover:shadow-lg hover:-translate-y-0.5
                ${
                  isSelected
                    ? "border-[#C8A951] bg-[#C8A951]/5 shadow-md"
                    : "border-border bg-card hover:border-[#C8A951]/50"
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#C8A951]" />
              )}
              {Icon && (
                <Icon
                  className={`h-7 w-7 transition-colors ${
                    isSelected
                      ? "text-[#C8A951]"
                      : "text-[#1B365D] group-hover:text-[#C8A951]"
                  }`}
                />
              )}
              <div className="space-y-1">
                <div
                  className={`font-medium text-sm ${
                    isSelected ? "text-[#1B365D]" : "text-foreground"
                  }`}
                >
                  {option.label}
                </div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
