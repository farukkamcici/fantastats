import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import {
    AlertCircle,
    Calendar,
    Swords,
    Trophy,
} from "lucide-react";
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
  let matchup = null;
  
  try {
    [league, myTeam] = await Promise.all([
      client.getLeague(leagueKey).catch(() => null),
      client.getMyTeam(leagueKey).catch(() => null),
    ]);

    matchup = myTeam?.key ? await client.getMyMatchup(myTeam.key).catch(() => null) : null;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Matchups
        </h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)]">
          <Calendar className="w-4 h-4" />
          <span>Week {league?.current_week ?? "-"}</span>
        </div>
      </div>

      {/* Current Matchup */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-[var(--accent-primary)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                This Week&apos;s Matchup
              </h2>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
              Week {league?.current_week}
            </span>
          </div>
        </div>

        {!matchup ? (
          <div className="p-6 text-[var(--text-secondary)] text-sm">
            Matchup data isn&apos;t available yet.
          </div>
        ) : (
          <div className="p-6">
            {/* Score Display */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-6">
              {/* Your Team */}
              <div className="text-center flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <Trophy className="w-3 h-3" />
                  Your Team
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] text-lg mb-2">
                  {matchup.myTeam.name}
                </h3>
                {typeof matchup.myTeam.points === "number" && (
                  <p className="text-4xl font-bold text-[var(--text-primary)]">
                    {matchup.myTeam.points}
                  </p>
                )}
              </div>

              {/* VS */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center">
                  <span className="text-lg font-bold text-[var(--text-tertiary)]">VS</span>
                </div>
              </div>

              {/* Opponent */}
              <div className="text-center flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)] text-xs font-medium">
                  <Swords className="w-3 h-3" />
                  Opponent
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] text-lg mb-2">
                  {matchup.opponent.name}
                </h3>
                {typeof matchup.opponent.points === "number" && (
                  <p className="text-4xl font-bold text-[var(--text-primary)]">
                    {matchup.opponent.points}
                  </p>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-tertiary)]">Matchup Status</span>
                <span className="font-medium text-[var(--text-secondary)]">
                  {(matchup.myTeam.points ?? 0) > (matchup.opponent.points ?? 0) ? (
                    <span className="text-green-500">Winning</span>
                  ) : (matchup.myTeam.points ?? 0) < (matchup.opponent.points ?? 0) ? (
                    <span className="text-red-500">Losing</span>
                  ) : (
                    <span className="text-yellow-500">Tied</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Season Record */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Season Record
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-[var(--bg-elevated)] rounded-lg">
            <p className="text-2xl font-bold text-green-500">
              {myTeam.wins ?? 0}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Wins
            </p>
          </div>
          <div className="text-center p-4 bg-[var(--bg-elevated)] rounded-lg">
            <p className="text-2xl font-bold text-red-500">
              {myTeam.losses ?? 0}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Losses
            </p>
          </div>
          <div className="text-center p-4 bg-[var(--bg-elevated)] rounded-lg">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              #{myTeam.rank ?? "-"}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Rank
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
