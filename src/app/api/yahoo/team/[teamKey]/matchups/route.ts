import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/team/[teamKey]/matchups
 * Get team matchups for the season
 * 
 * Query params:
 * - week: specific week number (optional, returns all if not specified)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { teamKey } = await params;

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week")
      ? parseInt(searchParams.get("week")!, 10)
      : undefined;

    const client = new YahooFantasyClient(session.accessToken);

    let matchups;
    if (week) {
      const matchup = await client.getMyMatchup(teamKey, week);
      matchups = matchup ? [matchup] : [];
    } else {
      matchups = await client.getAllMatchups(teamKey);
    }

    return NextResponse.json({
      success: true,
      matchups,
      count: matchups.length,
    });
  } catch (error) {
    console.error("Error fetching matchups:", error);
    return NextResponse.json(
      { error: "Failed to fetch matchups" },
      { status: 500 }
    );
  }
}
