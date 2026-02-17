import { DiscoveryWizard } from "@/components/interactive/discovery-wizard";
import { brand } from "@/config/brand";
import { Sparkles } from "lucide-react";

export default function InteractivePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-[#1B365D] text-white">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Discover Your Spirit</h1>
            <p className="text-xs text-white/70">{brand.tagline}</p>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <DiscoveryWizard />
      </main>
    </div>
  );
}
