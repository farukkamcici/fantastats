import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  const isPublicPage =
    pathname === "/" || pathname === "/login" || pathname === "/auth/error";

  // If already authenticated, skip landing/login and go straight to the app.
  if (token && isPublicPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/leagues";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // If not authenticated, only allow the landing + auth pages.
  if (!token && !isPublicPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all pages except:
  // - /api (handled by route auth checks, avoids breaking JSON fetches)
  // - Next.js internals / static assets
  // - Any path with a file extension (e.g. images in /public)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
