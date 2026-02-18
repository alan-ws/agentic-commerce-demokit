import { ProductGrid } from "@/components/widget/product-grid";
import { brand } from "@/config/brand";
import { Bot } from "lucide-react";

export default function WidgetPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b bg-gradient-to-r from-[#1B365D] to-[#1B365D]/90 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10">
            <Bot className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold">Explore Our Collection</h1>
        </div>
        <p className="text-sm text-white/70">
          Browse our spirits or ask {brand.agent.name} for a personalised
          recommendation.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <ProductGrid />
      </div>
    </div>
  );
}
