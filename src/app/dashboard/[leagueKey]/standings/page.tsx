import { ExportButton } from "@/components/export/ExportButton";
import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import { AlertCircle, Medal, TrendingDown, TrendingUp, Trophy } from "lucide-react";
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
  
  try {
    [standings, myTeam] = await Promise.all([
      client.getStandings(leagueKey).catch(() => null),
      client.getMyTeam(leagueKey).catch(() => null),
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

  const sortedTeams = [...standings.teams]
    .map((entry) => {
      const standingsMeta = entry.team_standings;
      const outcome = standingsMeta?.outcome_totals;
      return {
        key: entry.team.team_key,
        name: entry.team.name,
        isOwned: entry.team.is_owned_by_current_login,
        rank: standingsMeta?.rank ?? 999,
        wins: outcome?.wins ?? 0,
        losses: outcome?.losses ?? 0,
        ties: outcome?.ties ?? 0,
      };
    })
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            League Standings
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {sortedTeams.length} teams competing
          </p>
        </div>
        <ExportButton
          href={`/api/export/csv?type=standings&leagueKey=${leagueKey}`}
          label="Export Standings"
        />
      </div>

      {/* Standings Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Current Standings
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  W
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  L
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  T
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Win %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {sortedTeams.map((team, index) => {
                const isMyTeam = team.key === myTeam?.key || team.isOwned;
                const wins = Number(team.wins ?? 0);
                const losses = Number(team.losses ?? 0);
                const ties = Number(team.ties ?? 0);
                const totalGames = wins + losses + ties;
                const winPct =
                  totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";
                
                return (
                  <tr 
                    key={team.key}
                    className={`
                      ${isMyTeam ? "bg-[var(--accent-primary)]/5" : "hover:bg-[var(--bg-subtle)]"}
                      transition-colors
                    `}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {index < 3 ? (
                          <Medal className={`w-5 h-5 ${
                            index === 0 ? "text-yellow-500" : 
                            index === 1 ? "text-gray-400" : 
                            "text-amber-600"
                          }`} />
                        ) : (
                          <span className="w-5 text-center text-sm text-[var(--text-tertiary)]">
                            {team.rank !== 999 ? team.rank : index + 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-medium ${isMyTeam ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                          {team.name}
                        </span>
                        {isMyTeam && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-500 font-medium flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {wins}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-red-500 font-medium flex items-center justify-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {losses}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--text-secondary)]">
                      {ties}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[var(--text-primary)] font-medium">
                        {winPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
