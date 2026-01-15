import { ExportButton } from "@/components/export/ExportButton";
import { SortableStandingsTable } from "@/components/standings/SortableStandingsTable";
import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import { buildStatColumns } from "@/lib/yahoo/statColumns";
import { AlertCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
}

export default async function StandingsPage({ params }: PageProps) {
  const { leagueKey } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/");
  }

  const client = createYahooClient(session.accessToken);

  let standings = null;
  let myTeam = null;
  let leagueSettings = null;
  let league = null;

  try {
    [standings, myTeam, leagueSettings, league] = await Promise.all([
      client.getStandings(leagueKey).catch(() => null),
      client.getMyTeam(leagueKey).catch(() => null),
      client.getLeagueSettings(leagueKey).catch(() => null),
      client.getLeague(leagueKey).catch(() => null),
    ]);
  } catch (error) {
    console.error("Error fetching standings:", error);
  }

  if (!standings || standings.teams.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[var(--error-muted)] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[var(--error)]" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Unable to access standings
        </h1>
        <p className="text-[var(--text-secondary)]">
          You may not be a member of this league anymore.
        </p>
      </div>
    );
  }

  const statColumns = buildStatColumns(
    leagueSettings?.stat_categories?.stats || []
  );

  // Get number of playoff teams from settings
  const numPlayoffTeams = Number(leagueSettings?.num_playoff_teams ?? league?.settings?.num_playoff_teams ?? 6);

  const teamsData = standings.teams
    .map((entry) => {
      const standingsMeta = entry.team_standings;
      const outcome = standingsMeta?.outcome_totals;
      return {
        key: entry.team.team_key,
        name: entry.team.name,
        isOwned: Boolean(entry.team.is_owned_by_current_login),
        logoUrl: entry.team.team_logos?.[0]?.team_logo?.url,
        rank: standingsMeta?.rank ?? 999,
        playoffSeed: standingsMeta?.playoff_seed,
        wins: outcome?.wins ?? 0,
        losses: outcome?.losses ?? 0,
        ties: outcome?.ties ?? 0,
        percentage: outcome?.percentage ?? "0",
        gamesBack: standingsMeta?.games_back,
        waiverPriority: entry.team.waiver_priority as number | undefined,
        faabBalance: entry.team.faab_balance,
        numberOfMoves: entry.team.number_of_moves as number | undefined,
        numberOfTrades: entry.team.number_of_trades,
        teamStats: entry.team_stats,
        manager: entry.manager,
      };
    })
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            League Standings
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {teamsData.length} teams • Top {numPlayoffTeams} make playoffs
          </p>
        </div>
        <ExportButton
          href={`/api/export/csv?type=standings&leagueKey=${leagueKey}`}
          label="Export Standings"
        />
      </div>

      {/* Sortable Standings Table */}
      <SortableStandingsTable
        teams={teamsData}
        statColumns={statColumns}
        myTeamKey={myTeam?.key}
        numPlayoffTeams={numPlayoffTeams}
      />
    </div>
  );
}
