import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ teamKey: string }>;
}

/**
 * GET /api/yahoo/roster/[teamKey]
 * 
 * Returns the roster (players) for a specific team
 * Query params:
 *   - week: Optional week number for historical roster
 * 
 * teamKey format: {game_key}.l.{league_id}.t.{team_id}
 * Example: 454.l.12345.t.1
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { teamKey } = await params;
    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to access roster data" },
        { status: 401 }
      );
    }

    // Validate teamKey format
    if (!teamKey || !teamKey.includes(".t.")) {
      return NextResponse.json(
        { error: "InvalidRequest", message: "Invalid team key format" },
        { status: 400 }
      );
    }

    // Create Yahoo client and fetch roster
    const client = createYahooClient(session.accessToken);
    const weekNum = week ? parseInt(week, 10) : undefined;
    const roster = await client.getRoster(teamKey, weekNum);

    return NextResponse.json({
      success: true,
      teamKey,
      week: weekNum || "current",
      roster,
      count: roster.length,
    });
  } catch (error) {
    console.error("Error in /api/yahoo/roster/[teamKey]:", error);

    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { error: "TokenExpired", message: "Your session has expired. Please sign in again." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "InternalError", message: "Failed to fetch roster" },
      { status: 500 }
    );
  }
}
