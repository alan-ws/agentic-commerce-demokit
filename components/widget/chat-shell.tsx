"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import { useWidgetContext } from "./widget-context";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Maximize2,
  Minimize2,
  PanelRightClose,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatShell({ children }: { children: ReactNode }) {
  const { chatMode, setChatMode } = useWidgetContext();
  const [floatPos, setFloatPos] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const shellRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (chatMode !== "floating") return;
      const el = shellRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [chatMode]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (chatMode !== "floating") return;
      if (!(e.target as HTMLElement).hasPointerCapture(e.pointerId)) return;
      setFloatPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    },
    [chatMode]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }
    },
    []
  );

  const enterFloating = useCallback(() => {
    // Position bottom-right of viewport
    setFloatPos({
      x: typeof window !== "undefined" ? window.innerWidth - 416 : 0,
      y: typeof window !== "undefined" ? window.innerHeight - 596 : 0,
    });
    setChatMode("floating");
  }, [setChatMode]);

  // Minimized: render FAB only
  if (chatMode === "minimized") {
    return (
      <>
        {/* Keep children mounted but hidden */}
        <div className="h-0 w-0 overflow-hidden sr-only pointer-events-none">
          {children}
        </div>
        <button
          onClick={() => setChatMode("docked")}
          className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:bg-foreground/90 transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      </>
    );
  }

  // Floating: absolute positioned overlay
  if (chatMode === "floating") {
    return (
      <div
        ref={shellRef}
        className="fixed z-50 flex flex-col w-[400px] h-[580px] rounded-xl shadow-2xl border bg-background overflow-hidden"
        style={{ left: floatPos.x, top: floatPos.y }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 border-b bg-foreground text-background cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 opacity-60" />
            <span className="text-sm font-medium">Chat</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-background hover:bg-background/20"
              onClick={() => setChatMode("docked")}
              title="Dock"
            >
              <PanelRightClose className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-background hover:bg-background/20"
              onClick={() => setChatMode("minimized")}
              title="Minimize"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    );
  }

  // Docked: inline side panel
  return (
    <div
      className={cn(
        "w-[400px] shrink-0 border-l flex flex-col h-full bg-background"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b bg-foreground text-background">
        <span className="text-sm font-medium">Chat</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-background hover:bg-background/20"
            onClick={enterFloating}
            title="Float"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-background hover:bg-background/20"
            onClick={() => setChatMode("minimized")}
            title="Minimize"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
