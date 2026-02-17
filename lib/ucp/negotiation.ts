/**
 * UCP Capability Negotiation — spec version 2026-01-11
 * Parses UCP-Agent header (RFC 8941) and computes capability intersection.
 */

import { ucpConfig } from "@/lib/ucp/config";

export interface NegotiationResult {
  capabilities: string[];
  version: string;
}

/**
 * Parse UCP-Agent header.
 * Format: profile="https://platform.example.com/.well-known/ucp"
 */
export function parseUCPAgent(
  header: string | null
): { profile: string } | null {
  if (!header) return null;
  const match = header.match(/profile="([^"]+)"/);
  return match ? { profile: match[1] } : null;
}

/**
 * Negotiate capabilities. For the DemoKit, we skip remote profile fetching
 * and return all business capabilities. In production, this would fetch the
 * platform profile and compute the intersection.
 */
export async function negotiateCapabilities(
  _platformProfileUrl?: string
): Promise<NegotiationResult> {
  const capabilities = [
    ...ucpConfig.capabilities.core,
    ...ucpConfig.capabilities.extensions,
  ];

  return {
    capabilities,
    version: ucpConfig.ucp_version,
  };
}
