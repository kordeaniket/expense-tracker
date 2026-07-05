import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // CORS configuration
  const allowedOrigin = "http://localhost:3000";
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };

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
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

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
