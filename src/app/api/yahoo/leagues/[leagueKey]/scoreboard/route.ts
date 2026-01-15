import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooApiError, YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/leagues/[leagueKey]/scoreboard
 * Get the current week's scoreboard (matchups) for a league
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ leagueKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { leagueKey } = await params;

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get week from query params if provided
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get("week");
    const week = weekParam ? parseInt(weekParam, 10) : undefined;

    const client = new YahooFantasyClient(session.accessToken);
    const scoreboard = await client.getScoreboard(leagueKey, week);

    if (!scoreboard) {
      return NextResponse.json(
        { error: "Scoreboard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scoreboard,
    });
  } catch (error) {
    console.error("Error fetching scoreboard:", error);
    
    // Handle 403 - user not in league
    if (error instanceof YahooApiError && error.statusCode === 403) {
      return NextResponse.json(
        { success: false, error: "Not authorized to view this league", scoreboard: null },
        { status: 200 } // Return 200 with null data to prevent UI errors
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch scoreboard", scoreboard: null },
      { status: 200 }
    );
  }
}
