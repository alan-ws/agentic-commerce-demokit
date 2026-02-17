"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useJsonRenderMessage } from "@json-render/react";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Renderer } from "@/lib/render/renderer";
import { brand } from "@/config/brand";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function MessageContent({ message }: { message: UIMessage }) {
  const { spec, text, hasSpec } = useJsonRenderMessage(
    message.parts as { type: string; text?: string; data?: unknown }[]
  );
  const isUser = message.role === "user";
  const isStreaming = message.parts.some(
    (p) => p.type === "text" && "state" in p && p.state === "streaming"
  );

  const showText = !!text;

  return (
    <div
      className={cn("flex gap-3 py-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-[#1B365D] text-white"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex-1 space-y-2 min-w-0",
          isUser ? "flex flex-col items-end" : ""
        )}
      >
        {showText && (
          <div
            className={cn(
              "inline-block rounded-lg px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            {text}
          </div>
        )}
        {hasSpec && spec && (
          <div className="max-w-full">
            <Renderer spec={spec} loading={isStreaming} />
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatInterfaceProps {
  compact?: boolean;
}

export function ChatInterface({ compact = false }: ChatInterfaceProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );
  const { messages, sendMessage, status } = useChat({ transport });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-background",
        compact ? "h-full" : "h-[calc(100vh-4rem)]"
      )}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4"
      >
        <div className="max-w-3xl mx-auto py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="h-12 w-12 text-[#1B365D] mb-4" />
              <h2 className="text-lg font-semibold mb-1">
                {brand.agent.name}
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                {brand.agent.greeting}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageContent key={message.id} message={message} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 py-3">
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className="bg-[#1B365D] text-white text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about spirits, occasions, or flavors..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
