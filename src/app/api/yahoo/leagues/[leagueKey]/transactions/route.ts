import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { YahooFantasyClient } from "@/lib/yahoo/client";

/**
 * GET /api/yahoo/leagues/[leagueKey]/transactions
 * Get league transactions
 * 
 * Query params:
 * - types: comma-separated list (add,drop,trade,waiver) - default: all
 * - count: number of results (default: 25)
 * - start: pagination offset (default: 0)
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
    const types = searchParams.get("types") || undefined;
    const count = searchParams.get("count")
      ? parseInt(searchParams.get("count")!, 10)
      : 25;
    const start = searchParams.get("start")
      ? parseInt(searchParams.get("start")!, 10)
      : 0;

    const client = new YahooFantasyClient(session.accessToken);
    const transactions = await client.getTransactions(leagueKey, {
      types,
      count,
      start,
    });

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
