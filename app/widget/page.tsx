import { ChatInterface } from "@/components/chat/chat-interface";

export const metadata = {
  title: "Diageo Discovery Widget",
};

export default function WidgetPage() {
  return (
    <div className="h-screen w-full">
      <ChatInterface compact />
    </div>
  );
}
