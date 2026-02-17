/**
 * UCP Response Helpers — spec version 2026-01-11
 */

import { NextResponse } from "next/server";
import type { NegotiationResult } from "./negotiation";

export function ucpResponse<T extends { ucp?: unknown }>(
  data: T,
  negotiation: NegotiationResult,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

export function ucpError(
  status: number,
  code: string,
  message: string
): NextResponse {
  return NextResponse.json(
    {
      error: { code, message },
    },
    { status }
  );
}
