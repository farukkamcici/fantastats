import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/leagues/[leagueKey]
 * Get detailed league info including settings, standings, and scoreboard
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ leagueKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { leagueKey } = await params;

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = new YahooFantasyClient(session.accessToken);
    const league = await client.getLeague(leagueKey);

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      league,
    });
  } catch (error) {
    console.error("Error fetching league:", error);
    return NextResponse.json(
      { error: "Failed to fetch league" },
      { status: 500 }
    );
  }
}
