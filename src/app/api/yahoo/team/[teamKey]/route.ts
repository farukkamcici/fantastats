import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ teamKey: string }>;
}

/**
 * GET /api/yahoo/team/[teamKey]
 * 
 * Returns team details including roster
 * teamKey format: {game_key}.l.{league_id}.t.{team_id}
 * Example: 454.l.12345.t.1
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { teamKey } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to access team data" },
        { status: 401 }
      );
    }

    // Validate teamKey format
    if (!teamKey || !teamKey.includes(".t.")) {
      return NextResponse.json(
        { error: "InvalidRequest", message: "Invalid team key format" },
        { status: 400 }
      );
    }

    // Create Yahoo client and fetch team
    const client = createYahooClient(session.accessToken);
    const team = await client.getTeamWithRoster(teamKey);

    if (!team) {
      return NextResponse.json(
        { error: "NotFound", message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Error in /api/yahoo/team/[teamKey]:", error);

    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { error: "TokenExpired", message: "Your session has expired. Please sign in again." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "InternalError", message: "Failed to fetch team" },
      { status: 500 }
    );
  }
}
