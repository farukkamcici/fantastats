import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/leagues/[leagueKey]/draftresults
 * Get league draft results
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
    const draftResults = await client.getDraftResults(leagueKey);

    return NextResponse.json({
      success: true,
      draftResults,
      count: draftResults.length,
    });
  } catch (error) {
    console.error("Error fetching draft results:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft results" },
      { status: 500 }
    );
  }
}
