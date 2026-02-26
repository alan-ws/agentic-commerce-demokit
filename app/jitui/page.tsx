"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Wine,
  ShoppingBag,
  Play,
  ChevronRight,
  Monitor,
  Code2,
  ArrowRight,
} from "lucide-react";

interface DemoScenario {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  toolName: string;
  arguments: Record<string, unknown>;
}

const SCENARIOS: DemoScenario[] = [
  {
    id: "single-product",
    label: "get_product",
    description: '"Show me JW Black Label"',
    icon: <Wine className="h-4 w-4" />,
    toolName: "get_product",
    arguments: { productId: "jw-black" },
  },
  {
    id: "search",
    label: "search_products",
    description: '"Find me a scotch for gifting"',
    icon: <Search className="h-4 w-4" />,
    toolName: "search_products",
    arguments: { category: "scotch", occasion: "gifting" },
  },
  {
    id: "channels",
    label: "get_purchase_channels",
    description: '"Where to buy JW Black in GB?"',
    icon: <ShoppingBag className="h-4 w-4" />,
    toolName: "get_purchase_channels",
    arguments: { productId: "jw-black", market: "GB" },
  },
];

export default function JitUiPage() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [toolOutput, setToolOutput] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-resize iframe when it posts its height
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      try {
        const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
        if (data?.type === "oegaid-widget-resize" && iframeRef.current) {
          iframeRef.current.style.height = `${data.height + 16}px`;
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const runScenario = useCallback(
    async (scenario: DemoScenario) => {
      setActiveScenario(scenario.id);
      setToolOutput(null);
      setIframeSrc(null);
      setStep(1);
      setLoading(true);

      const res = await fetch("/api/demo/tool-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: scenario.toolName,
          arguments: scenario.arguments,
        }),
      });
      const data = await res.json();
      const output = JSON.stringify(data, null, 2);
      setToolOutput(output);
      setStep(2);

      await new Promise((r) => setTimeout(r, 400));
      setStep(3);
      setLoading(false);

      // Build /mcp-render URL with base64-encoded spec
      if (data.spec) {
        const encoded = btoa(
          unescape(encodeURIComponent(JSON.stringify(data.spec)))
        );
        setIframeSrc(`/mcp-render?s=${encoded}`);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              JIT UI — MCP Widget Renderer
            </h1>
            <p className="text-sm text-muted-foreground">
              One json-render spec → real React components via /mcp-render
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            /mcp-render
          </Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Flow diagram */}
        <div className="mb-8 rounded-lg border border-border/50 bg-muted/30 p-5">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            How it works in ChatGPT
          </p>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="px-3 py-1.5 rounded-md bg-background border font-medium">
              ChatGPT
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="px-3 py-1.5 rounded-md bg-background border text-xs">
              MCP tool call
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="px-3 py-1.5 rounded-md bg-background border text-xs">
              returns{" "}
              <code className="bg-muted px-1 rounded">
                {"{ spec, data }"}
              </code>
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="px-3 py-1.5 rounded-md bg-background border text-xs">
              thin shell → /mcp-render
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="px-3 py-1.5 rounded-md bg-background border font-medium">
              React renders spec → real components
            </span>
          </div>
        </div>

        {/* Scenario buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => runScenario(s)}
              disabled={loading}
              className={`text-left p-4 rounded-lg border transition-all ${
                activeScenario === s.id
                  ? "border-foreground/30 bg-muted/50 ring-1 ring-foreground/10"
                  : "border-border/50 hover:border-foreground/20 hover:bg-muted/30"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <span className="font-medium text-sm font-mono">
                  {s.label}
                </span>
                {activeScenario === s.id && step > 0 && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {step === 1
                      ? "Calling..."
                      : step === 2
                        ? "Got JSON"
                        : "Rendered"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground italic">
                {s.description}
              </p>
            </button>
          ))}
        </div>

        {/* Split view */}
        {activeScenario ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JSON output */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code2 className="h-4 w-4" />
                <span>Tool Output</span>
                <ChevronRight className="h-3 w-3" />
                <code className="text-xs font-mono">content[0].text</code>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 overflow-auto max-h-[600px]">
                {toolOutput ? (
                  <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
                    {toolOutput}
                  </pre>
                ) : (
                  <div className="p-12 text-center text-sm text-muted-foreground">
                    <Play className="h-5 w-5 mx-auto mb-2 animate-pulse" />
                    Calling MCP tool...
                  </div>
                )}
              </div>
            </div>

            {/* Rendered widget */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="h-4 w-4" />
                <span>Widget iframe</span>
                <ChevronRight className="h-3 w-3" />
                <code className="text-xs font-mono">/mcp-render</code>
              </div>
              <div className="rounded-lg border border-border/50 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                {step >= 3 && iframeSrc ? (
                  <iframe
                    ref={iframeRef}
                    src={iframeSrc}
                    className="w-full border-0"
                    style={{ minHeight: 320 }}
                  />
                ) : step >= 1 ? (
                  <div className="p-16 text-center text-sm text-muted-foreground">
                    {step === 1
                      ? "Waiting for tool response..."
                      : "Loading widget..."}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Monitor className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Click a scenario above to simulate a ChatGPT MCP tool call
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
