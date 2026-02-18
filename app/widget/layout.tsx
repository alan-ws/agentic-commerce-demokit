import type { Metadata } from "next";
import type { ReactNode } from "react";
import { WidgetProvider } from "@/components/widget/widget-context";
import { ChatShell } from "@/components/widget/chat-shell";

export const metadata: Metadata = {
  title: "Diageo Discovery Widget",
};

export default function WidgetLayout({
  children,
  chat,
}: {
  children: ReactNode;
  chat: ReactNode;
}) {
  return (
    <WidgetProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <ChatShell>{chat}</ChatShell>
      </div>
    </WidgetProvider>
  );
}
