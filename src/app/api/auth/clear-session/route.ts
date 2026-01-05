import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/clear-session
 * 
 * Clears all NextAuth-related cookies to force a fresh login.
 * Use this when the session is in a bad state.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // List of all possible NextAuth cookies
    const authCookies = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Host-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
      "next-auth.pkce.code_verifier",
      "__Secure-next-auth.pkce.code_verifier",
    ];

    // Delete each cookie
    for (const name of authCookies) {
      try {
        cookieStore.delete(name);
      } catch {
        // Cookie might not exist, ignore
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Session cleared successfully" 
    });
  } catch (error) {
    console.error("Error clearing session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/clear-session
 * 
 * Redirect version - clears cookies and redirects to home
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    
    const authCookies = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Host-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
    ];

    for (const name of authCookies) {
      try {
        cookieStore.delete(name);
      } catch {
        // Ignore
      }
    }

    // Redirect to home page
    return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Error clearing session:", error);
    return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }
}
