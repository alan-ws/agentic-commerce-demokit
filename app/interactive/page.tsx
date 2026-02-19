import { DiscoveryWizard } from "@/components/interactive/discovery-wizard";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { brand } from "@/config/brand";
import { Sparkles } from "lucide-react";

export default function InteractivePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-foreground text-background">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">Discover Your Spirit</h1>
            <p className="text-xs text-muted-foreground">{brand.tagline}</p>
          </div>
          <ModeToggle />
        </div>
      </header>
      <main className="flex-1">
        <DiscoveryWizard />
      </main>
    </div>
  );
}
