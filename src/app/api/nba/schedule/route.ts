import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { NbaClient } from "@/lib/nba/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing start_date or end_date" },
        { status: 400 }
      );
    }

    const client = new NbaClient();
    const games = await client.getGames({ startDate, endDate });

    return NextResponse.json({
      success: true,
      startDate,
      endDate,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error("Error fetching NBA schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch NBA schedule" },
      { status: 500 }
    );
  }
}
