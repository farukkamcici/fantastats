import { LeagueScoreboard } from "@/components/matchup/LeagueScoreboard";
import { MatchupSection } from "@/components/matchup/MatchupSection";
import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import { buildStatColumns } from "@/lib/yahoo/statColumns";
import { AlertCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
}

export default async function MatchupsPage({ params }: PageProps) {
  const { leagueKey } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/");
  }

  const client = createYahooClient(session.accessToken);

  let league = null;
  let myTeam = null;
  let matchupHistory: Awaited<ReturnType<typeof client.getAllMatchups>> = [];
  let currentMatchup = null;
  let scoreboard = null;
  let leagueSettings = null;
  
  try {
    [league, myTeam] = await Promise.all([
      client.getLeague(leagueKey).catch(() => null),
      client.getMyTeam(leagueKey).catch(() => null),
    ]);

    if (myTeam?.key) {
      [matchupHistory, scoreboard] = await Promise.all([
        client.getAllMatchups(myTeam.key).catch(() => []),
        client.getScoreboard(leagueKey).catch(() => null),
      ]);
      
      // Find current week matchup
      const currentWeek = league?.current_week || 1;
      currentMatchup = matchupHistory.find((m) => m.week === currentWeek) || matchupHistory[0] || null;
    }

    if (!league?.settings) {
      leagueSettings = await client.getLeagueSettings(leagueKey).catch(() => null);
    }
  } catch (error) {
    console.error("Error fetching matchup data:", error);
  }

  if (!myTeam) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[var(--error-muted)] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[var(--error)]" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Unable to access league
        </h1>
        <p className="text-[var(--text-secondary)]">
          You may not be a member of this league anymore.
        </p>
      </div>
    );
  }

  const statColumns = buildStatColumns(
    (league?.settings || leagueSettings)?.stat_categories?.stats || []
  );

  return (
    <div className="space-y-6">
      {/* Matchup Section with Week Selector, Score, Stats */}
      <MatchupSection
        initialMatchup={currentMatchup}
        matchupHistory={matchupHistory}
        statColumns={statColumns}
        myTeamKey={myTeam.key}
        currentWeek={league?.current_week ?? 1}
      />

      {/* League Scoreboard */}
      {scoreboard && scoreboard.matchups.length > 0 && (
        <LeagueScoreboard
          matchups={scoreboard.matchups}
          myTeamKey={myTeam.key}
          currentWeek={league?.current_week ?? 1}
        />
      )}
    </div>
  );
}
