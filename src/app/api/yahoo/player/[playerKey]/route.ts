import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/player/[playerKey]
 * Get player information and metadata
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

    const client = new YahooFantasyClient(session.accessToken);
    const player = await client.getPlayer(playerKey);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      player,
    });
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 }
    );
  }
}
