import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESTRICTED_MARKETS = ["SA", "IR", "AF", "LY", "SD", "YE", "KW", "BN"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect market from Vercel header or cookie
  const market =
    request.cookies.get("user-market")?.value ??
    request.headers.get("x-vercel-ip-country") ??
    "GB";

  // Check restricted markets
  if (RESTRICTED_MARKETS.includes(market)) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;text-align:center;padding:2rem;">
        <div>
          <h1>Not Available</h1>
          <p>This service is not available in your region.</p>
        </div>
      </body></html>`,
      {
        status: 451,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Age gate enforcement — skip for age-gate page itself, API routes, static assets
  const isAgeGatePage = pathname === "/age-gate";
  const isAgeVerified = request.cookies.get("age-verified")?.value === "true";

  if (!isAgeGatePage && !isAgeVerified) {
    const url = request.nextUrl.clone();
    url.pathname = "/age-gate";
    return NextResponse.redirect(url);
  }

  // Set market headers for downstream use
  const response = NextResponse.next();
  response.headers.set("x-user-market", market);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api routes (handle their own compliance)
     * - public files (images, etc.)
     */
    "/((?!_next|api|jitui|mcp-render|\\.well-known|favicon\\.ico|sitemap\\.xml|robots\\.txt|products|logo|agent-avatar|.*\\.svg|.*\\.png|.*\\.jpg).*)",
  ],
};
