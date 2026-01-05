import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * GET /api/yahoo/leagues
 * 
 * Returns all NBA fantasy leagues for the authenticated user
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to access your leagues" },
        { status: 401 }
      );
    }

    // Create Yahoo client and fetch leagues
    const client = createYahooClient(session.accessToken);
    const leagues = await client.getMyLeagues();

    return NextResponse.json({
      success: true,
      leagues,
      count: leagues.length,
    });
  } catch (error) {
    console.error("Error in /api/yahoo/leagues:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { error: "TokenExpired", message: "Your session has expired. Please sign in again." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "InternalError", message: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
