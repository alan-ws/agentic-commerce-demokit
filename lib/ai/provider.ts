/**
 * AI Provider — Vercel AI Gateway
 *
 * Uses the AI SDK's built-in gateway provider. Model strings in
 * "creator/model-name" format route through the Vercel AI Gateway,
 * authenticated via AI_GATEWAY_API_KEY env var.
 *
 * When deployed to Vercel, OIDC auth works without any key.
 */

import { gateway } from "ai";

const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5-20250929";

export function getModel() {
  const modelId = process.env.AI_MODEL ?? DEFAULT_MODEL;
  return gateway(modelId);
}

export function getModelId(): string {
  return process.env.AI_MODEL ?? DEFAULT_MODEL;
}
