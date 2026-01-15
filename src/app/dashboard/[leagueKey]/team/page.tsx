import { authOptions } from "@/lib/auth";
import { NbaClient } from "@/lib/nba/client";
import { getBalldontlieTeamId } from "@/lib/nba/teamMapping";
import { createYahooClient } from "@/lib/yahoo/client";
import { ExportButton } from "@/components/export/ExportButton";
import { getOptimalLineupByGames } from "@/lib/analysis/lineup";
import type { LineupSuggestion } from "@/lib/analysis/lineup";
import type { SimplifiedPlayer } from "@/lib/yahoo/types";
import {
    AlertCircle,
    Clock,
    Shirt,
    User,
    Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
}

export default async function TeamPage({ params }: PageProps) {
  const { leagueKey } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/");
  }

  const client = createYahooClient(session.accessToken);
  
  let myTeam = null;
  let team = null;
  let league = null;
  let roster: SimplifiedPlayer[] = [];
  let gamesByTeamId = new Map<number, number>();
  let weekRange: { startDate: string; endDate: string } | null = null;
  let lineupSuggestions: LineupSuggestion[] = [];
  let errorState: "no-access" | "fetch-error" | null = null;
  
  try {
    // Get user's team in this league
    myTeam = await client.getMyTeam(leagueKey).catch(() => null);
  
    if (!myTeam) {
      errorState = "no-access";
    } else {
      [team, roster, league] = await Promise.all([
        client.getTeamWithRoster(myTeam.key).catch(() => null),
        client.getRoster(myTeam.key).catch(() => []),
        client.getLeague(leagueKey).catch(() => null),
      ]);
    }

    if (roster.length > 0) {
      weekRange = getWeekRange(new Date());
      try {
        const nbaClient = new NbaClient();
        const games = await nbaClient.getGames({
          startDate: weekRange.startDate,
          endDate: weekRange.endDate,
        });
        gamesByTeamId = countGamesByTeamId(games);
        lineupSuggestions = getOptimalLineupByGames(roster, gamesByTeamId, 8);
      } catch (scheduleError) {
        console.error("Error fetching NBA schedule:", scheduleError);
      }
      const statWeek = league?.current_week;
      const statType = statWeek ? "week" : "season";
      roster = await Promise.all(
        roster.map(async (player) => {
          try {
            const stats = await client.getPlayerStats(player.key, statType, {
              week: statWeek,
            });
            return { ...player, stats };
          } catch {
            return player;
          }
        })
      );
    }
  } catch (error) {
    console.error("Error fetching team data:", error);
    errorState = "fetch-error";
  }

  if (errorState === "no-access") {
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

  if (errorState === "fetch-error") {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[var(--error-muted)] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[var(--error)]" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Error loading team
        </h1>
        <p className="text-[var(--text-secondary)]">
          Please try again later.
        </p>
      </div>
    );
  }
  
  if (!myTeam) {
    return null;
  }

  // Group players by position
  const starters = roster.filter(
    (p) =>
      p.selectedPosition &&
      !["BN", "IL", "IL+", "NA"].includes(p.selectedPosition)
  );
  const bench = roster.filter((p) => p.selectedPosition === "BN");
  const injured = roster.filter((p) =>
    ["IL", "IL+", "NA"].includes(p.selectedPosition || "")
  );

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {team?.name || myTeam.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <Users className="w-4 h-4" />
              {roster.length} Players
            </span>
            {starters.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <Shirt className="w-4 h-4" />
                {starters.length} Active
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3">
          <StatBadge label="Roster" value={`${roster.length}`} />
          <StatBadge label="Active" value={`${starters.length}`} />
        </div>
      </div>

      {weekRange && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-tertiary)]">
          <span>
            Games this week: {weekRange.startDate} – {weekRange.endDate}
          </span>
          <ExportButton
            href={`/api/export/csv?type=roster&leagueKey=${leagueKey}`}
            label="Export Roster"
          />
          <ExportButton
            href={`/api/export/csv?type=matchups&leagueKey=${leagueKey}`}
            label="Export Matchups"
          />
        </div>
      )}

      {/* Roster */}
      <div className="space-y-6">
        {lineupSuggestions.length > 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Optimal Lineup (Games This Week)
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Prioritized by games scheduled this week.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {lineupSuggestions.map((suggestion) => (
                <div
                  key={suggestion.player.key}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {suggestion.player.name}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {suggestion.player.teamAbbr} · {suggestion.player.position}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    {suggestion.gamesThisWeek} games
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {roster.length === 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              No roster data available yet.
            </p>
          </div>
        )}
        {/* Starters */}
        {starters.length > 0 && (
          <RosterSection
            title="Active Roster"
            icon={<Shirt className="w-5 h-5" />}
            players={starters}
            accentColor="var(--success)"
            gamesByTeamId={gamesByTeamId}
          />
        )}

        {/* Bench */}
        {bench.length > 0 && (
          <RosterSection
            title="Bench"
            icon={<Clock className="w-5 h-5" />}
            players={bench}
            accentColor="var(--warning)"
            gamesByTeamId={gamesByTeamId}
          />
        )}

        {/* Injured */}
        {injured.length > 0 && (
          <RosterSection
            title="Injured List"
            icon={<AlertCircle className="w-5 h-5" />}
            players={injured}
            accentColor="var(--error)"
            gamesByTeamId={gamesByTeamId}
          />
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-center">
      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
      <p className="text-lg font-semibold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

function RosterSection({
  title,
  icon,
  players,
  accentColor,
  gamesByTeamId,
}: {
  title: string;
  icon: React.ReactNode;
  players: SimplifiedPlayer[];
  accentColor: string;
  gamesByTeamId: Map<number, number>;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      <div
        className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3"
        style={{ color: accentColor }}
      >
        {icon}
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <span className="ml-auto text-sm text-[var(--text-tertiary)]">
          {players.length} players
        </span>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {players.map((player) => (
          <PlayerRow key={player.key} player={player} gamesByTeamId={gamesByTeamId} />
        ))}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  gamesByTeamId,
}: {
  player: SimplifiedPlayer;
  gamesByTeamId: Map<number, number>;
}) {
  const hasStatus = player.status && player.status !== "H";
  const teamId = player.teamAbbr ? getBalldontlieTeamId(player.teamAbbr) : undefined;
  const gamesThisWeek = teamId ? gamesByTeamId.get(teamId) : undefined;
  const statEntries = player.stats
    ? Object.entries(player.stats)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, 3)
    : [];

  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[var(--bg-subtle)] transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-[var(--text-tertiary)]" />
        </div>

        {/* Player Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text-primary)] truncate">
              {player.name}
            </span>
            {hasStatus && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--error-muted)] text-[var(--error)] font-medium">
                {player.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <span>{player.teamAbbr}</span>
            <span>·</span>
            <span>{player.position}</span>
            {gamesThisWeek !== undefined && (
              <>
                <span>·</span>
                <span>{gamesThisWeek} games</span>
              </>
            )}
          </div>
          {statEntries.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--text-tertiary)]">
              {statEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5"
                >
                  {key.replace("stat_", "stat ")}: {value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slot Position */}
      <div className="flex-shrink-0 text-right">
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)]">
          {player.selectedPosition || "-"}
        </span>
      </div>
    </div>
  );
}

function getWeekRange(date: Date) {
  const day = date.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
  };
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countGamesByTeamId(games: { home_team: { id: number }; visitor_team: { id: number } }[]) {
  const map = new Map<number, number>();
  games.forEach((game) => {
    map.set(game.home_team.id, (map.get(game.home_team.id) || 0) + 1);
    map.set(game.visitor_team.id, (map.get(game.visitor_team.id) || 0) + 1);
  });
  return map;
}
