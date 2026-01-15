import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * PUT /api/yahoo/roster/[teamKey]/update
 * Update roster positions for a team
 *
 * Request body:
 * {
 *   "date": "2025-01-06",  // For NBA daily lineups
 *   "players": [
 *     { "playerKey": "418.p.5764", "position": "PG" },
 *     { "playerKey": "418.p.6014", "position": "BN" }
 *   ]
 * }
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ teamKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { teamKey } = await params;

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { date, players } = body;

    if (!players || !Array.isArray(players) || players.length === 0) {
      return NextResponse.json(
        { error: "Players array is required" },
        { status: 400 }
      );
    }

    const client = new YahooFantasyClient(session.accessToken);
    const result = await client.updateRoster(teamKey, {
      date,
      players,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error updating roster:", error);
    return NextResponse.json(
      { error: "Failed to update roster" },
      { status: 500 }
    );
  }
}
