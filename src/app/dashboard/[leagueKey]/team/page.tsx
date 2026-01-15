import { TeamRosterSection } from "@/components/dashboard/TeamRosterSection";
import { ExportButton } from "@/components/export/ExportButton";
import { authOptions } from "@/lib/auth";
import { NbaClient } from "@/lib/nba/client";
import { createYahooClient } from "@/lib/yahoo/client";
import { buildStatColumns } from "@/lib/yahoo/statColumns";
import type { SimplifiedPlayer } from "@/lib/yahoo/types";
import {
  AlertCircle,
  Shirt,
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
  let leagueSettings = null;
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

      if (!league?.settings) {
        leagueSettings = await client.getLeagueSettings(leagueKey).catch(() => null);
      }
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
      // Use season stats - weekly stats for current week often return empty
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

  const starters = roster.filter(
    (p) =>
      p.selectedPosition &&
      !["BN", "IL", "IL+", "NA"].includes(p.selectedPosition)
  );
  const bench = roster.filter((p) => p.selectedPosition === "BN");
  const injured = roster.filter((p) =>
    ["IL", "IL+", "NA"].includes(p.selectedPosition || "")
  );
  const hasPositions = roster.some((player) => Boolean(player.selectedPosition));
  const orderedPlayers = hasPositions
    ? [
        ...starters,
        ...bench,
        ...injured,
        ...roster.filter((player) => !player.selectedPosition),
      ]
    : roster;
  const activeCount = starters.length > 0 ? starters.length : roster.length;
  const statColumns = buildStatColumns(
    (league?.settings || leagueSettings)?.stat_categories?.stats || []
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
          <StatBadge label="Active" value={`${activeCount}`} />
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
        <TeamRosterSection
          players={orderedPlayers}
          statColumns={statColumns}
          gamesByTeamId={Object.fromEntries(gamesByTeamId)}
          leagueKey={leagueKey}
          teamKey={myTeam.key}
          currentWeek={league?.current_week}
        />
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
