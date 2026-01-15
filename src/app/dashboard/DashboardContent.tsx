"use client";

import { useLeague } from "@/contexts";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Crown,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Types
interface SimplifiedLeague {
  key: string;
  id: string;
  name: string;
  logoUrl?: string;
  season: string;
  currentWeek: number;
  numTeams: number;
  scoringType: string;
  isActive: boolean;
}

interface SimplifiedTeam {
  key: string;
  id: string;
  name: string;
  logoUrl?: string;
  isOwned: boolean;
  rank?: number;
  wins?: number;
  losses?: number;
  ties?: number;
}

interface MatchupTeam {
  team: {
    team_key: string;
    team_id: string;
    name: string;
    team_logos?: { team_logo: { size: string; url: string } }[];
    is_owned_by_current_login?: boolean;
  };
  team_points?: {
    coverage_type?: string;
    week: string | number;
    total: string;
  };
  team_projected_points?: {
    week: string | number;
    total: string;
  } | null;
  win_probability?: number;
}

interface Matchup {
  week: string | number;
  status: string;
  is_tied?: boolean;
  winner_team_key?: string;
  teams: MatchupTeam[];
}

interface ScoreboardData {
  week: number;
  matchups: Matchup[];
}

interface ScoreboardResponse {
  success: boolean;
  scoreboard: ScoreboardData;
}

interface LeagueTeamsResponse {
  success: boolean;
  teams: SimplifiedTeam[];
}

interface StandingsResponse {
  success: boolean;
  standings?: {
    teams: Array<{
      team: {
        team_key: string;
      };
      team_standings: {
        rank: number;
        outcome_totals: {
          wins: number;
          losses: number;
          ties: number;
        };
      };
    }>;
  };
}

export function DashboardContent() {
  const { currentLeague, setCurrentLeague } = useLeague();
  const router = useRouter();
  const { data: session } = useSession();
  const [debugOpen, setDebugOpen] = useState(false);

  const { data: leagues, isLoading: leaguesLoading, error: leaguesError } = useQuery<SimplifiedLeague[]>({
    queryKey: ["leagues"],
    queryFn: async () => {
      const res = await fetch("/api/yahoo/leagues");
      if (!res.ok) throw new Error("Failed to fetch leagues");
      const data = await res.json();
      return data.leagues || [];
    },
  });

  const activeLeagues = leagues?.filter(l => l.isActive) || [];

  const scoreboardQueries = useQueries({
    queries: activeLeagues.map((league) => ({
      queryKey: ["scoreboard", league.key],
      queryFn: async () => {
        try {
          const res = await fetch(`/api/yahoo/leagues/${league.key}/scoreboard`);
          if (!res.ok) return null;
          const data: ScoreboardResponse = await res.json();
          return data.success ? data.scoreboard : null;
        } catch {
          return null;
        }
      },
      enabled: activeLeagues.length > 0,
      retry: false,
    })),
  });

  const teamsQueries = useQueries({
    queries: activeLeagues.map((league) => ({
      queryKey: ["teams", league.key],
      queryFn: async () => {
        try {
          const res = await fetch(`/api/yahoo/leagues/${league.key}/teams`);
          if (!res.ok) return [];
          const data: LeagueTeamsResponse = await res.json();
          return data.success ? data.teams : [];
        } catch {
          return [];
        }
      },
      enabled: activeLeagues.length > 0,
      retry: false,
    })),
  });

  // Fetch standings to get W-L-T records
  const standingsQueries = useQueries({
    queries: activeLeagues.map((league) => ({
      queryKey: ["standings", league.key],
      queryFn: async () => {
        try {
          const res = await fetch(`/api/yahoo/leagues/${league.key}/standings`);
          if (!res.ok) return null;
          const data: StandingsResponse = await res.json();
          return data.success ? data.standings : null;
        } catch {
          return null;
        }
      },
      enabled: activeLeagues.length > 0,
      retry: false,
    })),
  });

  const debugLeagueKey = currentLeague?.key || activeLeagues[0]?.key || "";
  const debugLeagueIndex = useMemo(
    () => activeLeagues.findIndex((league) => league.key === debugLeagueKey),
    [activeLeagues, debugLeagueKey]
  );
  const debugTeams =
    debugLeagueIndex >= 0 ? teamsQueries[debugLeagueIndex]?.data : undefined;
  const debugTeamKey = debugTeams?.find((team) => team.isOwned)?.key || "";

  const { data: rosterData } = useQuery({
    queryKey: ["debug-roster", debugTeamKey],
    queryFn: async () => {
      const res = await fetch(`/api/yahoo/roster/${debugTeamKey}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: Boolean(debugTeamKey),
    staleTime: 5 * 60 * 1000,
  });

  const debugPlayerKey = rosterData?.roster?.[0]?.key || "";

  const navigateToLeague = (league: SimplifiedLeague, tab: string = "matchups") => {
    setCurrentLeague({ key: league.key, name: league.name });
    router.push(`/dashboard/${league.key}/${tab}`);
  };

  // Helper to parse standings and get team records
  const getTeamStandings = (
    standingsData: StandingsResponse["standings"]
  ): Map<string, { rank: number; wins: number; losses: number; ties: number }> => {
    const map = new Map<string, { rank: number; wins: number; losses: number; ties: number }>();

    const toInt = (value: unknown) => {
      if (typeof value === "number") return Number.isFinite(value) ? value : 0;
      if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const teams = standingsData?.teams || [];
    teams.forEach((entry) => {
      const teamKey = entry.team?.team_key;
      const outcome = entry.team_standings?.outcome_totals;
      if (!teamKey) return;
      map.set(teamKey, {
        rank: toInt(entry.team_standings?.rank),
        wins: toInt(outcome?.wins),
        losses: toInt(outcome?.losses),
        ties: toInt(outcome?.ties),
      });
    });

    return map;
  };

  if (leaguesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--interactive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-tertiary)]">Loading leagues...</p>
        </div>
      </div>
    );
  }

  if (leaguesError || !leagues) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--error)]/10 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-[var(--error)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Unable to load leagues</h2>
        <p className="text-sm text-[var(--text-tertiary)]">Please try refreshing the page</p>
      </div>
    );
  }

  const currentWeek = activeLeagues[0]?.currentWeek || 0;

  // Sort leagues: accessible ones first, inaccessible at bottom
  const sortedLeagueData = activeLeagues.map((league, index) => {
    const teamsData = teamsQueries[index]?.data || [];
    const isLoading = scoreboardQueries[index]?.isLoading || teamsQueries[index]?.isLoading || standingsQueries[index]?.isLoading;
    const hasAccess = teamsData.length > 0 || isLoading;
    return { league, index, hasAccess, isLoading };
  }).sort((a, b) => {
    // Accessible leagues first
    if (a.hasAccess && !b.hasAccess) return -1;
    if (!a.hasAccess && b.hasAccess) return 1;
    return 0;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-tertiary)]">Week {currentWeek} • {activeLeagues.length} league{activeLeagues.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Leagues */}
      {activeLeagues.length > 0 ? (
        <div className="space-y-4">
          {sortedLeagueData.map(({ league, index, hasAccess, isLoading }) => {
            const scoreboardData = scoreboardQueries[index]?.data;
            const standingsData = standingsQueries[index]?.data ?? undefined;
            const teamStandings = getTeamStandings(standingsData);
            
            const myMatchup = scoreboardData?.matchups?.find((m) =>
              m.teams.some((t) => t.team?.is_owned_by_current_login)
            );

            return (
              <LeagueCard
                key={league.key}
                league={league}
                scoreboard={scoreboardData}
                myMatchup={myMatchup}
                teamStandings={teamStandings}
                isLoading={isLoading}
                hasAccess={hasAccess}
                onNavigate={(tab) => navigateToLeague(league, tab)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
          <h2 className="text-base font-medium text-[var(--text-primary)] mb-1">No Active Leagues</h2>
          <p className="text-sm text-[var(--text-tertiary)]">You don&apos;t have any active fantasy leagues.</p>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50">
        {debugOpen && (
          <div className="w-80 max-w-[90vw] rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Debug Keys
              </h3>
              <button
                className="text-xs text-[var(--text-tertiary)]"
                onClick={() => setDebugOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div>
                <p className="text-[var(--text-tertiary)]">League Key</p>
                <code className="block bg-[var(--bg-elevated)] p-2 rounded-md break-all">
                  {debugLeagueKey || "—"}
                </code>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Team Key</p>
                <code className="block bg-[var(--bg-elevated)] p-2 rounded-md break-all">
                  {debugTeamKey || "—"}
                </code>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Player Key</p>
                <code className="block bg-[var(--bg-elevated)] p-2 rounded-md break-all">
                  {debugPlayerKey || "—"}
                </code>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Access Token</p>
                <code className="block bg-[var(--bg-elevated)] p-2 rounded-md break-all">
                  {session?.accessToken || "—"}
                </code>
              </div>
            </div>
          </div>
        )}
        {!debugOpen && (
          <button
            className="btn btn-secondary btn-sm shadow-lg"
            onClick={() => setDebugOpen(true)}
          >
            Debug
          </button>
        )}
      </div>
    </div>
  );
}

function LeagueCard({
  league,
  scoreboard,
  myMatchup,
  teamStandings,
  isLoading,
  hasAccess,
  onNavigate,
}: {
  league: SimplifiedLeague;
  scoreboard: ScoreboardData | null | undefined;
  myMatchup: Matchup | undefined;
  teamStandings: Map<string, { rank: number; wins: number; losses: number; ties: number }>;
  isLoading: boolean;
  hasAccess: boolean;
  onNavigate: (tab: string) => void;
}) {
  const matchups = scoreboard?.matchups || [];

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      {/* League Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors"
        onClick={() => onNavigate("matchups")}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--interactive)]/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-[var(--interactive)]" />
          </div>
          <div>
            <h2 className="font-medium text-[var(--text-primary)] text-sm">{league.name}</h2>
            <p className="text-xs text-[var(--text-tertiary)]">{league.numTeams} teams</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
            Week {league.currentWeek}
          </span>
          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-[var(--interactive)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasAccess ? (
        <div className="py-4 px-4 text-center bg-[var(--bg-subtle)]">
          <p className="text-xs text-[var(--text-tertiary)]">Unable to access this league</p>
        </div>
      ) : (
        <div className="p-4">
          {/* My Matchup - Highlighted */}
          {myMatchup && (
            <MyMatchupCard matchup={myMatchup} teamStandings={teamStandings} onClick={() => onNavigate("matchups")} />
          )}

          {/* Other Matchups - Mini Grid */}
          {matchups.filter((m) => !m.teams.some((t) => t.team?.is_owned_by_current_login)).length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchups
                  .filter((m) => !m.teams.some((t) => t.team?.is_owned_by_current_login))
                  .map((matchup, idx) => (
                    <MiniMatchupCard key={idx} matchup={matchup} teamStandings={teamStandings} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MyMatchupCard({
  matchup,
  teamStandings,
  onClick,
}: {
  matchup: Matchup;
  teamStandings: Map<string, { rank: number; wins: number; losses: number; ties: number }>;
  onClick: () => void;
}) {
  const teams = matchup.teams || [];
  const myMatchupTeam = teams.find((t) => t.team?.is_owned_by_current_login);
  const opponentTeam = teams.find((t) => !t.team?.is_owned_by_current_login);

  if (!myMatchupTeam || !opponentTeam) return null;

  const myScore = parseFloat(myMatchupTeam.team_points?.total || "0");
  const oppScore = parseFloat(opponentTeam.team_points?.total || "0");
  const isWinning = myScore > oppScore;
  const isLosing = myScore < oppScore;

  const myStandings = teamStandings.get(myMatchupTeam.team?.team_key || "");
  const oppStandings = teamStandings.get(opponentTeam.team?.team_key || "");

  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 rounded-lg bg-[var(--interactive)]/5 border border-[var(--interactive)]/20 cursor-pointer hover:bg-[var(--interactive)]/10 transition-colors"
      onClick={onClick}
    >
      {/* My Team */}
      <div className="flex items-center gap-3 min-w-0">
        <TeamLogo url={myMatchupTeam.team?.team_logos?.[0]?.team_logo?.url} name={myMatchupTeam.team?.name || ""} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-[var(--interactive)]" />
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">{myMatchupTeam.team?.name}</span>
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">
            {myStandings ? `#${myStandings.rank} • ${myStandings.wins}-${myStandings.losses}-${myStandings.ties}` : '—'}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-2 px-3">
        <span className={`text-base font-semibold tabular-nums ${isWinning ? 'text-[var(--success)]' : isLosing ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>
          {myMatchupTeam.team_points?.total || "0"}
        </span>
        <span className="text-xs text-[var(--text-muted)]">—</span>
        <span className={`text-base font-semibold tabular-nums ${isLosing ? 'text-[var(--success)]' : isWinning ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>
          {opponentTeam.team_points?.total || "0"}
        </span>
      </div>

      {/* Opponent */}
      <div className="flex items-center gap-3 min-w-0 justify-end">
        <div className="min-w-0 flex-1 text-right">
          <p className="text-sm font-medium text-[var(--text-secondary)] truncate">{opponentTeam.team?.name}</p>
          <span className="text-xs text-[var(--text-tertiary)]">
            {oppStandings ? `#${oppStandings.rank} • ${oppStandings.wins}-${oppStandings.losses}-${oppStandings.ties}` : '—'}
          </span>
        </div>
        <TeamLogo url={opponentTeam.team?.team_logos?.[0]?.team_logo?.url} name={opponentTeam.team?.name || ""} size="md" />
      </div>
    </div>
  );
}

function MiniMatchupCard({ matchup, teamStandings }: { matchup: Matchup; teamStandings: Map<string, { rank: number; wins: number; losses: number; ties: number }> }) {
  const [team1, team2] = matchup.teams || [];
  if (!team1 || !team2) return null;

  const score1 = parseFloat(team1.team_points?.total || "0");
  const score2 = parseFloat(team2.team_points?.total || "0");
  const standings1 = teamStandings.get(team1.team?.team_key || "");
  const standings2 = teamStandings.get(team2.team?.team_key || "");

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2.5 px-3 rounded-lg bg-[var(--bg-subtle)]">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <TeamLogo url={team1.team?.team_logos?.[0]?.team_logo?.url} name={team1.team?.name || ""} size="xs" />
        <div className="min-w-0">
          <span className="text-xs text-[var(--text-secondary)] truncate block">{team1.team?.name}</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {standings1 ? `${standings1.wins}-${standings1.losses}-${standings1.ties}` : ""}
          </span>
        </div>
      </div>

      {/* Center score */}
      <div className="flex items-center justify-center gap-2">
        <span className={`text-sm font-semibold tabular-nums ${score1 > score2 ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          {team1.team_points?.total || "0"}
        </span>
        <span className="text-xs text-[var(--text-muted)]">—</span>
        <span className={`text-sm font-semibold tabular-nums ${score2 > score1 ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          {team2.team_points?.total || "0"}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 min-w-0 justify-end">
        <div className="min-w-0 text-right">
          <span className="text-xs text-[var(--text-secondary)] truncate block">{team2.team?.name}</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {standings2 ? `${standings2.wins}-${standings2.losses}-${standings2.ties}` : ""}
          </span>
        </div>
        <TeamLogo url={team2.team?.team_logos?.[0]?.team_logo?.url} name={team2.team?.name || ""} size="xs" />
      </div>
    </div>
  );
}

function TeamLogo({ url, name, size = "md" }: { url?: string; name: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const sizeClasses = {
    xs: "w-5 h-5",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSize = {
    xs: "text-[7px]",
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  if (url) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-[var(--bg-elevated)] shrink-0`}>
        <Image src={url} alt={name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0`}>
      <span className={`${textSize[size]} font-semibold text-[var(--text-tertiary)]`}>
        {name.substring(0, 2).toUpperCase()}
      </span>
    </div>
  );
}
