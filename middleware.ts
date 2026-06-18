import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // Pass the real IP to API routes so rate limiting works behind proxies
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown";

  response.headers.set("x-forwarded-for", ip);

  return response;
}

export const config = {
  // Only run on API routes — page routes get headers from next.config.ts
  matcher: ["/api/:path*"],
};
