import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { toCsv } from "@/lib/utils/csv";
import { createYahooClient } from "@/lib/yahoo/client";

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
      const [myTeam, leagueSettings] = await Promise.all([
        client.getMyTeam(leagueKey),
        client.getLeagueSettings(leagueKey).catch(() => null),
      ]);
      if (!myTeam) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
      
      // Get roster with stats
      let roster = await client.getRoster(myTeam.key);
      
      // Fetch stats for each player
      roster = await Promise.all(
        roster.map(async (player) => {
          try {
            const stats = await client.getPlayerStats(player.key, "season");
            return { ...player, stats };
          } catch {
            return player;
          }
        })
      );
      
      // Get stat category names and create ordered list
      const statCategories = leagueSettings?.stat_categories?.stats || [];
      const statsMap: { key: string; label: string }[] = [];
      
      for (const cat of statCategories) {
        if (cat.stat?.stat_id) {
          const label = cat.stat.display_name || cat.stat.name || cat.stat.abbr || `Stat ${cat.stat.stat_id}`;
          statsMap.push({
            key: `stat_${cat.stat.stat_id}`,
            label,
          });
        }
      }
      
      const rows = roster.map((player) => {
        // Base columns
        const row: Record<string, string | number> = {
          "Player": player.name,
          "Team": player.teamAbbr || "",
          "Position": player.position || "",
          "Status": player.status || "",
        };
        
        // Add stats in order
        const playerStats = player.stats as Record<string, unknown> | undefined;
        for (const stat of statsMap) {
          row[stat.label] = (playerStats?.[stat.key] as string | number) ?? "-";
        }
        
        return row;
      });
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
      const [standings, leagueSettings] = await Promise.all([
        client.getStandings(leagueKey),
        client.getLeagueSettings(leagueKey).catch(() => null),
      ]);
      if (!standings) {
        return NextResponse.json({ error: "Standings not found" }, { status: 404 });
      }
      
      // Get stat category names
      const statCategories = leagueSettings?.stat_categories?.stats || [];
      const statIdToName: Record<string, string> = {};
      for (const cat of statCategories) {
        if (cat.stat?.stat_id && cat.stat?.name) {
          statIdToName[`stat_${cat.stat.stat_id}`] = cat.stat.name;
        }
      }
      
      const rows = standings.teams.map((entry) => {
        const row: Record<string, string | number> = {
          rank: entry.team_standings?.rank ?? "",
          team: entry.team.name,
          manager: entry.manager?.nickname ?? "",
          wins: entry.team_standings?.outcome_totals?.wins ?? "",
          losses: entry.team_standings?.outcome_totals?.losses ?? "",
          ties: entry.team_standings?.outcome_totals?.ties ?? "",
          winPct: entry.team_standings?.outcome_totals?.percentage ?? "",
          gamesBack: entry.team_standings?.games_back ?? "",
          faabBalance: entry.team.faab_balance ?? "",
          moves: entry.team.number_of_moves ?? "",
          trades: entry.team.number_of_trades ?? "",
        };
        
        // Add season stats
        if (entry.team_stats) {
          for (const [key, value] of Object.entries(entry.team_stats)) {
            const statName = statIdToName[key] || key;
            row[statName] = value;
          }
        }
        
        return row;
      });
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
