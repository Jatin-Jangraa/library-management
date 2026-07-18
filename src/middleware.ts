import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const role = token.role as string;

    if (pathname.startsWith("/admin") && role !== "owner" && role !== "staff") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (pathname.startsWith("/student") && (role === "owner" || role === "staff")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
