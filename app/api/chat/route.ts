import {
  streamText,
  stepCountIs,
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { pipeJsonRender } from "@json-render/core";
import { getModel } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { commerceTools } from "@/lib/ai/tools";

export async function POST(request: Request) {
  const {
    messages,
    market,
  }: { messages: UIMessage[]; market?: string } = await request.json();

  const model = getModel();
  const systemPrompt = buildSystemPrompt(market ?? "GB");
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    tools: commerceTools,
    stopWhen: stepCountIs(5),
  });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(pipeJsonRender(result.toUIMessageStream()));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
