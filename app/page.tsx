import { ChatInterface } from "@/components/chat/chat-interface";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { brand } from "@/config/brand";
import { Bot } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-foreground text-background">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">{brand.agent.name}</h1>
            <p className="text-xs text-muted-foreground">{brand.tagline}</p>
          </div>
          <ModeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
