import { authOptions } from "@/lib/auth";
import { NbaClient } from "@/lib/nba/client";
import { getBalldontlieTeamId } from "@/lib/nba/teamMapping";
import { createYahooClient } from "@/lib/yahoo/client";
import { ExportButton } from "@/components/export/ExportButton";
import type { SimplifiedPlayer, YahooStatCategoryEntry } from "@/lib/yahoo/types";
import {
    AlertCircle,
    Shirt,
    User,
    Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  let errorState: "no-access" | "fetch-error" | null = null;
  const hasNbaKey = Boolean(process.env.BALLDONTLIE_API_KEY);
  
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
      if (hasNbaKey) {
        try {
          const nbaClient = new NbaClient();
          const games = await nbaClient.getGames({
            startDate: weekRange.startDate,
            endDate: weekRange.endDate,
          });
          gamesByTeamId = countGamesByTeamId(games);
        } catch (scheduleError) {
          console.error("Error fetching NBA schedule:", scheduleError);
        }
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
  const orderedPlayers = [...starters, ...bench, ...injured];
  const statColumns = buildStatColumns(
    league?.settings?.stat_categories?.stats || []
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
        {!hasNbaKey && (
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            NBA schedule data is unavailable. Add `BALLDONTLIE_API_KEY` in your
            production environment to enable weekly game counts.
          </div>
        )}
        {roster.length === 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              No roster data available yet.
            </p>
          </div>
        )}
        {orderedPlayers.length > 0 && (
          <RosterTable
            players={orderedPlayers}
            statColumns={statColumns}
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

function RosterTable({
  players,
  statColumns,
  gamesByTeamId,
}: {
  players: SimplifiedPlayer[];
  statColumns: StatColumn[];
  gamesByTeamId: Map<number, number>;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <Shirt className="w-5 h-5 text-[var(--accent)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Roster
        </h2>
        <span className="ml-auto text-sm text-[var(--text-tertiary)]">
          {players.length} players
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Pos</th>
              <th className="px-4 py-3 text-left font-medium">Player</th>
              <th className="px-4 py-3 text-center font-medium">Games</th>
              <th className="px-4 py-3 text-center font-medium">% Rost</th>
              {statColumns.map((column) => (
                <th key={column.key} className="px-3 py-3 text-center font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {players.map((player) => (
              <RosterRow
                key={player.key}
                player={player}
                statColumns={statColumns}
                gamesByTeamId={gamesByTeamId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RosterRow({
  player,
  statColumns,
  gamesByTeamId,
}: {
  player: SimplifiedPlayer;
  statColumns: StatColumn[];
  gamesByTeamId: Map<number, number>;
}) {
  const hasStatus = player.status && player.status !== "H";
  const teamId = player.teamAbbr ? getBalldontlieTeamId(player.teamAbbr) : undefined;
  const gamesThisWeek = teamId ? gamesByTeamId.get(teamId) : undefined;
  const percentOwned =
    player.percentOwned !== undefined ? `${Math.round(player.percentOwned)}%` : "-";

  return (
    <tr className="hover:bg-[var(--bg-subtle)] transition-colors">
      <td className="px-4 py-3 text-left text-[var(--text-secondary)]">
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--bg-elevated)] text-xs font-semibold">
          {player.selectedPosition || "-"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden">
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-[var(--text-tertiary)]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--text-primary)]">
                {player.name}
              </span>
              {hasStatus && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--error-muted)] text-[var(--error)] font-medium">
                  {player.status}
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--text-tertiary)]">
              {player.teamAbbr} · {player.position}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
        {gamesThisWeek ?? "-"}
      </td>
      <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
        {percentOwned}
      </td>
      {statColumns.map((column) => (
        <td
          key={`${player.key}-${column.key}`}
          className="px-3 py-3 text-center text-[var(--text-secondary)]"
        >
          {getStatValue(player.stats, column, column.label)}
        </td>
      ))}
    </tr>
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

type StatColumn = {
  key: string;
  label: string;
  statId?: number;
};

function buildStatColumns(categories: YahooStatCategoryEntry[]): StatColumn[] {
  return categories
    .filter((entry) => {
      const enabled = entry.stat.enabled;
      return enabled === 1 || enabled === "1" || enabled === true;
    })
    .map((entry) => {
      const stat = entry.stat;
      const label = stat.abbr || stat.display_name || stat.name;
      return {
        key: `stat_${stat.stat_id}`,
        label,
        statId: Number(stat.stat_id),
      };
    });
}

function getStatValue(
  stats: SimplifiedPlayer["stats"],
  column: StatColumn,
  label: string
) {
  if (!stats || !column.statId) return "-";
  const value = stats[`stat_${column.statId}`];
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "number") {
    if (label.includes("%")) {
      return value < 1 ? value.toFixed(3) : value.toFixed(1);
    }
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }
  return value;
}
