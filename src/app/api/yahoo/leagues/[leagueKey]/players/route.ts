import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/leagues/[leagueKey]/players
 * Get players in a league (free agents by default)
 * 
 * Query params:
 * - status: FA (free agents), W (waivers), T (taken), A (all) - default: A
 * - position: PG, SG, SF, PF, C, G, F, Util
 * - sort: stat_id to sort by (default: OR = ownership rank)
 * - count: number of results (default: 25, max: 25)
 * - start: pagination offset (default: 0)
 * - search: player name search term
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "A" | "FA" | "W" | "T" | null;
    const position = searchParams.get("position") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const count = searchParams.get("count")
      ? parseInt(searchParams.get("count")!, 10)
      : undefined;
    const start = searchParams.get("start")
      ? parseInt(searchParams.get("start")!, 10)
      : undefined;
    const search = searchParams.get("search");

    const client = new YahooFantasyClient(session.accessToken);

    let players;
    if (search) {
      // Use search endpoint
      players = await client.searchPlayers(leagueKey, search);
    } else {
      // Use free agents endpoint with filters
      players = await client.getFreeAgents(leagueKey, {
        status: status || "A",
        position,
        sort,
        count,
        start,
      });
    }

    return NextResponse.json({
      success: true,
      players,
      count: players.length,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
