import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  // If already authenticated, skip landing/login and go straight to the app.
  if (token && (pathname === "/" || pathname === "/login")) {
    const url = req.nextUrl.clone();
    url.pathname = "/leagues";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // If not authenticated, protect app routes.
  if (!token && (pathname.startsWith("/leagues") || pathname.startsWith("/dashboard"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/leagues/:path*", "/dashboard/:path*"],
};
