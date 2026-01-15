import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/player/[playerKey]/stats
 * Get player statistics
 * 
 * Query params:
 * - type: "week" or "season" (default: season)
 * - week: week number (required if type=week)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { playerKey } = await params;

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") as "week" | "season") || "season";
    const week = searchParams.get("week")
      ? parseInt(searchParams.get("week")!, 10)
      : undefined;

    const client = new YahooFantasyClient(session.accessToken);
    const stats = await client.getPlayerStats(playerKey, type, { week });

    return NextResponse.json({
      success: true,
      stats,
      type,
      week,
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch player stats" },
      { status: 500 }
    );
  }
}
