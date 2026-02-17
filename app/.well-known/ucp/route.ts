/**
 * UCP Discovery Profile — GET /.well-known/ucp
 * Spec: .ucp-spec/source/discovery/profile_schema.json
 */

import { NextRequest, NextResponse } from "next/server";
import { generateProfile } from "@/lib/ucp/profile";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

  const profile = generateProfile(baseUrl);

  return NextResponse.json(profile, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
