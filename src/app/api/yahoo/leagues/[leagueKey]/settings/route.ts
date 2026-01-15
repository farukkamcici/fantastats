import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/leagues/[leagueKey]/settings
 * Get league settings including roster positions, stat categories, etc.
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
    const settings = await client.getLeagueSettings(leagueKey);

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching league settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch league settings" },
      { status: 500 }
    );
  }
}
