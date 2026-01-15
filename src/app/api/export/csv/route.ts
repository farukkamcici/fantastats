import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import { toCsv } from "@/lib/utils/csv";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const leagueKey = searchParams.get("leagueKey");

    if (!type || !leagueKey) {
      return NextResponse.json(
        { error: "Missing type or leagueKey" },
        { status: 400 }
      );
    }

    const client = createYahooClient(session.accessToken);

    if (type === "roster") {
      const myTeam = await client.getMyTeam(leagueKey);
      if (!myTeam) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
      const roster = await client.getRoster(myTeam.key);
      const rows = roster.map((player) => ({
        name: player.name,
        team: player.teamAbbr,
        position: player.position,
        selectedPosition: player.selectedPosition || "",
        status: player.status || "",
      }));
      return csvResponse(toCsv(rows), "roster.csv");
    }

    if (type === "matchups") {
      const myTeam = await client.getMyTeam(leagueKey);
      if (!myTeam) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
      const matchups = await client.getAllMatchups(myTeam.key);
      const rows = matchups.map((matchup) => ({
        week: matchup.week,
        status: matchup.status,
        myTeam: matchup.myTeam.name,
        myPoints: matchup.myTeam.points ?? "",
        opponent: matchup.opponent.name,
        opponentPoints: matchup.opponent.points ?? "",
      }));
      return csvResponse(toCsv(rows), "matchups.csv");
    }

    if (type === "transactions") {
      const transactions = await client.getTransactions(leagueKey, { count: 50 });
      const rows = transactions.flatMap((transaction) =>
        transaction.players.map((player) => ({
          date: new Date(transaction.timestamp * 1000).toISOString(),
          type: transaction.type,
          status: transaction.status,
          player: player.name,
          action: player.type,
          sourceTeam: player.sourceTeamName || player.sourceTeamKey || "",
          destTeam: player.destTeamName || player.destTeamKey || "",
        }))
      );
      return csvResponse(toCsv(rows), "transactions.csv");
    }

    if (type === "standings") {
      const standings = await client.getStandings(leagueKey);
      if (!standings) {
        return NextResponse.json({ error: "Standings not found" }, { status: 404 });
      }
      const rows = standings.teams.map((entry) => ({
        team: entry.team.name,
        rank: entry.team_standings?.rank ?? "",
        wins: entry.team_standings?.outcome_totals?.wins ?? "",
        losses: entry.team_standings?.outcome_totals?.losses ?? "",
        ties: entry.team_standings?.outcome_totals?.ties ?? "",
      }));
      return csvResponse(toCsv(rows), "standings.csv");
    }

    return NextResponse.json({ error: "Unsupported export type" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
