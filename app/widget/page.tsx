import { ProductGrid } from "@/components/widget/product-grid";
import { PickedForYou } from "@/components/widget/picked-for-you";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { brand } from "@/config/brand";
import { Bot } from "lucide-react";

export default function WidgetPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b bg-background">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-foreground text-background">
            <Bot className="h-5 w-5" />
          </div>
          <h1 className="flex-1 text-lg font-semibold">Explore Our Collection</h1>
          <ModeToggle />
        </div>
        <p className="text-sm text-muted-foreground">
          Browse our spirits or ask {brand.agent.name} for a personalised
          recommendation.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <PickedForYou />
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Full Collection</h2>
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}
