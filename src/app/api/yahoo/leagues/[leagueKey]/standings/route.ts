import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/leagues/[leagueKey]/standings
 * Get league standings
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
    const standings = await client.getStandings(leagueKey);

    if (!standings) {
      return NextResponse.json(
        { error: "Standings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      standings,
    });
  } catch (error) {
    console.error("Error fetching standings:", error);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
