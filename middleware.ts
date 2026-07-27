import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // CORS configuration
  const origin = request.headers.get("origin");
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
  
  if (origin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  } else {
    corsHeaders["Access-Control-Allow-Origin"] = "*";
    // If using "*", we must remove allow-credentials for strict browsers, though standard same-origin requests often don't check this.
    delete corsHeaders["Access-Control-Allow-Credentials"];
  }

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Authentication check for protected routes
  const path = request.nextUrl.pathname;
  const isProtectedPath = [
    "/dashboard",
    "/expenses",
    "/income",
    "/reports",
    "/settings",
    "/budgets",
    "/goals",
    "/api/expenses",
    "/api/income",
    "/api/budgets",
    "/api/goals",
  ].some((prefix) => path.startsWith(prefix));

  if (isProtectedPath) {
    let token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Fallback for Vercel production: sometimes NEXTAUTH_URL isn't explicitly set to https://
    // which causes getToken to look for the non-secure cookie, but NextAuth sets the secure one.
    if (!token && process.env.NODE_ENV === "production") {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: true,
      });
    }

    if (!token) {
      if (path.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access" }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Apply CORS headers to all standard responses
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/income/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/budgets/:path*",
    "/goals/:path*",
    "/api/:path*",
  ],
};
