"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Renderer } from "@/lib/render/renderer";
import type { Spec } from "@json-render/core";

function decodeSpec(encoded: string): Spec | null {
  try {
    const json = atob(encoded);
    return JSON.parse(json) as Spec;
  } catch {
    return null;
  }
}

export default function McpRenderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[200px] p-4 text-sm text-muted-foreground animate-pulse">
          Loading widget...
        </div>
      }
    >
      <McpRenderInner />
    </Suspense>
  );
}

function McpRenderInner() {
  const searchParams = useSearchParams();
  const [spec, setSpec] = useState<Spec | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Decode from URL search param
  useEffect(() => {
    const s = searchParams.get("s");
    if (s) {
      const decoded = decodeSpec(s);
      if (decoded) {
        setSpec(decoded);
      } else {
        setError("Invalid spec in URL parameter");
      }
    }
  }, [searchParams]);

  // Also listen for postMessage (fallback for /jitui demo)
  const handleMessage = useCallback(
    (ev: MessageEvent) => {
      if (spec) return; // already have a spec
      try {
        const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
        if (data?.spec?.root && data?.spec?.elements) {
          setSpec(data.spec);
        } else if (data?.root && data?.elements) {
          setSpec(data);
        }
      } catch {
        // ignore non-JSON messages
      }
    },
    [spec]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Post height back to parent for iframe auto-resize
  useEffect(() => {
    if (!spec) return;
    const postHeight = () => {
      try {
        const h = document.documentElement.scrollHeight;
        window.parent.postMessage(
          { type: "diageo-widget-resize", height: h },
          "*"
        );
      } catch {}
    };
    // Post after render settles
    const t = setTimeout(postHeight, 100);
    const observer = new ResizeObserver(postHeight);
    observer.observe(document.body);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [spec]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-4 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-4 text-sm text-muted-foreground animate-pulse">
        Loading widget...
      </div>
    );
  }

  return (
    <div className="p-2">
      <Renderer spec={spec} />
    </div>
  );
}
