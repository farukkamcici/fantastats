import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware for auth-based routing
 * 
 * Flow:
 * - Public pages (/, /login, /auth/*): Anyone can access
 * - Protected pages (/leagues, /teams/*): Requires valid session
 * - API routes: Handled by individual route handlers
 * 
 * Session error handling:
 * - If session has RefreshAccessTokenError, redirect to /auth/error
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get token (session)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Define public pages that don't require auth
  const isPublicPage = 
    pathname === "/" || 
    pathname === "/login" || 
    pathname.startsWith("/auth/");

  // Check if token has an error (e.g., refresh failed)
  const hasTokenError = token?.error === "RefreshAccessTokenError";

  // If user has a broken session, clear it and send to error page
  if (hasTokenError && !pathname.startsWith("/auth/")) {
    console.log("[Middleware] Token has error, redirecting to auth error");
    const url = req.nextUrl.clone();
    url.pathname = "/auth/error";
    url.searchParams.set("error", "RefreshAccessTokenError");
    return NextResponse.redirect(url);
  }

  // If authenticated user tries to access public pages, redirect to app
  // BUT only if they have a valid token (no errors)
  if (token && !hasTokenError && isPublicPage) {
    console.log("[Middleware] Authenticated user on public page, redirecting to /leagues");
    const url = req.nextUrl.clone();
    url.pathname = "/leagues";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // If unauthenticated user tries to access protected pages
  if (!token && !isPublicPage) {
    console.log("[Middleware] Unauthenticated user on protected page, redirecting to /");
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Match all pages except API routes and static files
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - Files with extensions (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
