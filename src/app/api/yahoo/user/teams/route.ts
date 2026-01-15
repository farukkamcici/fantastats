import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/user/teams
 * Get all teams owned by the current user across all leagues
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = new YahooFantasyClient(session.accessToken);
    const teams = await client.getMyTeamsAcrossLeagues();

    return NextResponse.json({
      success: true,
      teams,
      count: teams.length,
    });
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch user teams" },
      { status: 500 }
    );
  }
}
