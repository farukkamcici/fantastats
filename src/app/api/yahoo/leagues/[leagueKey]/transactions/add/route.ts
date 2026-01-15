import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * POST /api/yahoo/leagues/[leagueKey]/transactions/add
 * Add a free agent to your team
 *
 * Request body:
 * {
 *   "playerKey": "418.p.5764",
 *   "teamKey": "418.l.12345.t.1"
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ leagueKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { leagueKey } = await params;

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { playerKey, teamKey } = body;

    if (!playerKey || !teamKey) {
      return NextResponse.json(
        { error: "playerKey and teamKey are required" },
        { status: 400 }
      );
    }

    const client = new YahooFantasyClient(session.accessToken);
    const result = await client.addPlayer(leagueKey, playerKey, teamKey);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error adding player:", error);
    return NextResponse.json(
      { error: "Failed to add player" },
      { status: 500 }
    );
  }
}
