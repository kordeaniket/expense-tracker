import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/income/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/budgets/:path*",
    "/goals/:path*",
    "/api/expenses/:path*",
    "/api/income/:path*",
    "/api/budgets/:path*",
    "/api/goals/:path*",
  ],
};
