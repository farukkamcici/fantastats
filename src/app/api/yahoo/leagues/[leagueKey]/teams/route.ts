import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooApiError, YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/leagues/[leagueKey]/teams
 * Get all teams in a league
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

    const client = new YahooFantasyClient(session.accessToken);
    const teams = await client.getTeams(leagueKey);

    return NextResponse.json({
      success: true,
      teams,
      count: teams.length,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    
    // Handle 403 - user not in league
    if (error instanceof YahooApiError && error.statusCode === 403) {
      return NextResponse.json(
        { success: false, error: "Not authorized to view this league", teams: [] },
        { status: 200 } // Return 200 with empty data to prevent UI errors
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams", teams: [] },
      { status: 200 }
    );
  }
}
