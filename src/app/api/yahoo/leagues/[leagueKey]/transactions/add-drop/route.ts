import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * POST /api/yahoo/leagues/[leagueKey]/transactions/add-drop
 * Add a player and drop another in a single transaction
 *
 * Request body:
 * {
 *   "addPlayerKey": "418.p.5764",
 *   "dropPlayerKey": "418.p.6014",
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
    const { addPlayerKey, dropPlayerKey, teamKey } = body;

    if (!addPlayerKey || !dropPlayerKey || !teamKey) {
      return NextResponse.json(
        { error: "addPlayerKey, dropPlayerKey, and teamKey are required" },
        { status: 400 }
      );
    }

    const client = new YahooFantasyClient(session.accessToken);
    const result = await client.addDropPlayer(
      leagueKey,
      addPlayerKey,
      dropPlayerKey,
      teamKey
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error executing add/drop:", error);
    return NextResponse.json(
      { error: "Failed to execute add/drop transaction" },
      { status: 500 }
    );
  }
}
