import { FreeAgentFilters } from "@/components/free-agents/FreeAgentFilters";
import { FreeAgentsTable } from "@/components/free-agents/FreeAgentsTable";
import { StreamerList } from "@/components/streaming/StreamerList";
import { getStreamingSuggestions, type StreamingSuggestion } from "@/lib/analysis/streaming";
import { authOptions } from "@/lib/auth";
import { NbaClient } from "@/lib/nba/client";
import { getBalldontlieTeamId } from "@/lib/nba/teamMapping";
import { createYahooClient } from "@/lib/yahoo/client";
import { getCompoundSortDefinition, type CompoundSortKey, type CompoundSortOrder } from "@/lib/yahoo/compoundSort";
import { buildStatColumns, injectIndividualStats, type StatColumn } from "@/lib/yahoo/statColumns";
import { COMPOUND_STAT_MAPPING, NBA_STAT_MAPPING } from "@/lib/yahoo/statMapping";
import type { SimplifiedPlayer } from "@/lib/yahoo/types";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Helper functions defined at top to avoid scoping issues
function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

interface PageProps {
  params: Promise<{ leagueKey: string }>;
  searchParams?: Promise<{ q?: string; position?: string; start?: string; status?: string; sort?: string; sortType?: string; healthy?: string; today?: string; compoundSort?: CompoundSortKey; compoundA?: string; compoundB?: string; compoundOrder?: CompoundSortOrder; compoundStats?: string }>;
}

const DEFAULT_COUNT = 25;

export default async function FreeAgentsPage({ params, searchParams }: PageProps) {
  const { leagueKey } = await params;
  const { q, position, start, status, sort, sortType, healthy, today, compoundSort, compoundA, compoundB, compoundOrder, compoundStats } = (await searchParams) || {};
  const hasGameToday = today === "1";
  const compoundSortDef = getCompoundSortDefinition(compoundSort);
  const compoundStatsList = (compoundStats || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const compoundStatIds = compoundStatsList
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
  const compoundAId = compoundA ? Number(compoundA) : NaN;
  const compoundBId = compoundB ? Number(compoundB) : NaN;
  const compoundOrderFinal: CompoundSortOrder = compoundOrder === "asc" ? "asc" : "desc";
  const customCompoundConfig =
    Number.isFinite(compoundAId) && Number.isFinite(compoundBId) && compoundAId !== compoundBId
      ? { statIds: [compoundAId, compoundBId] as [number, number], order: compoundOrderFinal }
      : undefined;
  const sortKeys = (sort || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean)
    .filter((key) => key !== "AR");
  const isRgtwSort = sortKeys.includes("RGTW");
  const hasMultiSort = sortKeys.length > 1;
  const isSearch = Boolean(q);
  const compoundConfig =
    compoundStatIds.length > 0
      ? { statIds: compoundStatIds, order: "desc" as const }
      : customCompoundConfig || (compoundSortDef ? { statIds: compoundSortDef.statIds, order: compoundSortDef.order } : undefined);
  const shouldLocalSort = isRgtwSort || hasMultiSort || isSearch || Boolean(compoundConfig);

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/");
  }

  const client = createYahooClient(session.accessToken);
  const nbaClient = new NbaClient();

  const pageStart = start ? Math.max(parseInt(start, 10), 0) : 0;
  const pageCount = DEFAULT_COUNT;

  let filteredPlayers: SimplifiedPlayer[] = [];
  let pagedPlayers: SimplifiedPlayer[] = [];
  let hasNextPage: boolean | undefined;
  let streamingSuggestions: StreamingSuggestion[] = [];
  let weekRange: { startDate: string; endDate: string } | null = null;
  let gamesRemainingMap = new Map<number, number>();
  const todaysGames = new Map<number, string>();
  let statColumns: StatColumn[] = [];
  let statOptions: { value: string; label: string }[] = [];

  try {
    // Parallel fetch: Players + League Settings (for stat labels)
    const sortParam = shouldLocalSort ? "AR" : sortKeys[0] || "AR";
    const freeAgentOptions = {
      status: (status as "FA" | "W" | "T" | "A") || "A",
      position: position || undefined,
      sort: sortParam,
      sortType: (sortType as "season" | "lastweek" | "lastmonth") || "season",
    };

    const needsFullRoster = hasGameToday || (shouldLocalSort && !isSearch);

    const fetchAllFreeAgents = async () => {
      const allPlayers: SimplifiedPlayer[] = [];
      const batchSize = pageCount;
      let batchStart = 0;
      let pageIndex = 0;
      const maxPages = 100;

      while (pageIndex < maxPages) {
        const batch = await client.getFreeAgents(leagueKey, {
          ...freeAgentOptions,
          count: batchSize,
          start: batchStart,
        });
        if (batch.length === 0) break;
        allPlayers.push(...batch);
        if (batch.length < batchSize) break;
        batchStart += batchSize;
        pageIndex += 1;
      }

      return allPlayers;
    };

    const [playersBase, leagueSettings] = await Promise.all([
      q
        ? client.searchPlayers(leagueKey, q)
        : needsFullRoster
          ? fetchAllFreeAgents()
          : client.getFreeAgents(leagueKey, {
              ...freeAgentOptions,
              count: pageCount,
              start: pageStart,
            }),
      client.getLeagueSettings(leagueKey),
    ]);
    
    filteredPlayers = playersBase;

    // Filter out injured players if healthy filter is enabled
    const healthyOnly = healthy === "1";
    if (healthyOnly) {
      filteredPlayers = filteredPlayers.filter(p => !p.status);
    }

    // Map stat IDs to labels using buildStatColumns and inject individual stats
    if (leagueSettings?.stat_categories) {
       statColumns = injectIndividualStats(buildStatColumns(leagueSettings.stat_categories.stats));
       if (!statColumns.some((column) => column.statId === 0)) {
         const gpDef = NBA_STAT_MAPPING[0];
         if (gpDef) {
           statColumns = [
             { key: `stat_${gpDef.id}`, label: gpDef.abbr, statId: gpDef.id },
             ...statColumns,
           ];
         }
       }

       const compoundStatIds = new Set(
         Object.keys(COMPOUND_STAT_MAPPING).map((statId) => Number(statId))
       );
       statOptions = statColumns
         .filter(
           (column) =>
             column.statId !== undefined &&
             column.statId !== null &&
             !compoundStatIds.has(column.statId) &&
             ![3, 6].includes(column.statId)
         )
         .map((column) => ({
           value: String(column.statId),
           label: column.label,
         }));
    }

    // Fetch Schedule & Calculate Games Remaining
    if (filteredPlayers.length > 0) {
      weekRange = getWeekRange(new Date());
      const games = await nbaClient.getGames({
        startDate: weekRange.startDate,
        endDate: weekRange.endDate,
      });
      const todayStr = formatDateKey(new Date());
      gamesRemainingMap = new Map<number, number>();
      games.forEach((game) => {
        const gameDate = typeof game.date === "string" ? game.date.slice(0, 10) : "";
        if (!gameDate || gameDate < todayStr) return;
        gamesRemainingMap.set(game.home_team.id, (gamesRemainingMap.get(game.home_team.id) || 0) + 1);
        gamesRemainingMap.set(game.visitor_team.id, (gamesRemainingMap.get(game.visitor_team.id) || 0) + 1);
      });
      
      // Compute Today's Opponents
      const todaysGameList = games.filter(g => g.date.startsWith(todayStr));
      
      todaysGameList.forEach(game => {
        const homeId = game.home_team.id;
        const visitorId = game.visitor_team.id;
        const homeAbbr = game.home_team.abbreviation;
        const visitorAbbr = game.visitor_team.abbreviation;
        
        todaysGames.set(homeId, `vs ${visitorAbbr}`);
        todaysGames.set(visitorId, `@ ${homeAbbr}`);
      });

      if (hasGameToday) {
        filteredPlayers = filteredPlayers.filter((player) => {
          const nbaTeamId = player.teamAbbr
            ? getBalldontlieTeamId(player.teamAbbr)
            : undefined;
          return nbaTeamId ? todaysGames.has(nbaTeamId) : false;
        });
      }

      if (shouldLocalSort && (Boolean(compoundConfig) || sortKeys.length > 0)) {
        const getRemainingGames = (player: SimplifiedPlayer) => {
          const teamId = player.teamAbbr ? getBalldontlieTeamId(player.teamAbbr) : undefined;
          return teamId ? gamesRemainingMap.get(teamId) || 0 : 0;
        };

        const getCompoundValue = (player: SimplifiedPlayer, statId: number) => {
          const stats = player.stats;
          if (!stats) return null;
          for (const [compoundIdRaw, mapping] of Object.entries(COMPOUND_STAT_MAPPING)) {
            const { firstStatId, secondStatId } = mapping;
            if (statId !== firstStatId && statId !== secondStatId) continue;
            const compoundValue = stats[`stat_${compoundIdRaw}`];
            if (typeof compoundValue !== "string") return null;
            const parts = compoundValue.split("/");
            if (parts.length !== 2) return null;
            const selected = statId === firstStatId ? parts[0] : parts[1];
            const trimmed = selected.trim();
            if (!trimmed || trimmed === "-") return null;
            const numeric = parseFloat(trimmed);
            return Number.isNaN(numeric) ? null : numeric;
          }
          return null;
        };

        const getStatValue = (player: SimplifiedPlayer, statId: number) => {
          const stats = player.stats;
          if (!stats) return null;
          const key = `stat_${statId}`;
          const value = stats[key];
          if (value === undefined || value === null || value === "" || value === "-") {
            return getCompoundValue(player, statId);
          }
          if (typeof value === "number") return value;
          const numeric = parseFloat(String(value));
          return Number.isNaN(numeric) ? null : numeric;
        };

        const compareNumeric = (aVal: number | null, bVal: number | null, order: "asc" | "desc") => {
          if (aVal === null && bVal === null) return 0;
          if (aVal === null) return 1;
          if (bVal === null) return -1;
          return order === "asc" ? aVal - bVal : bVal - aVal;
        };

        filteredPlayers = filteredPlayers.sort((a, b) => {
          if (compoundConfig) {
            const selected = Array.from(new Set(compoundConfig.statIds));
            const toScoreComponent = (statId: number, raw: number | null) => {
              const value = raw ?? 0;
              const order = NBA_STAT_MAPPING[statId]?.sortOrder || "desc";
              // Turnovers (TO, statId 19): higher is worse, so always subtract.
              if (statId === 19) return -value;
              return order === "asc" ? -value : value;
            };
            const aScore = selected.reduce((sum, statId) => sum + toScoreComponent(statId, getStatValue(a, statId)), 0);
            const bScore = selected.reduce((sum, statId) => sum + toScoreComponent(statId, getStatValue(b, statId)), 0);
            const scoreDiff = bScore - aScore;
            if (scoreDiff !== 0) return scoreDiff;
          }

          for (const key of sortKeys) {
            if (key === "RGTW") {
              const diff = getRemainingGames(b) - getRemainingGames(a);
              if (diff !== 0) return diff;
              continue;
            }
            if (key === "NAME") {
              const diff = a.name.localeCompare(b.name);
              if (diff !== 0) return diff;
              continue;
            }
            const statId = Number(key);
            if (!Number.isNaN(statId)) {
              const order = NBA_STAT_MAPPING[statId]?.sortOrder || "desc";
              const diff = compareNumeric(getStatValue(a, statId), getStatValue(b, statId), order);
              if (diff !== 0) return diff;
            }
          }
          return a.name.localeCompare(b.name);
        });
      }

      streamingSuggestions = getStreamingSuggestions(filteredPlayers, gamesRemainingMap, 6);
    }

    if (needsFullRoster) {
      hasNextPage = pageStart + pageCount < filteredPlayers.length;
      pagedPlayers = filteredPlayers.slice(pageStart, pageStart + pageCount);
    } else {
      pagedPlayers = filteredPlayers;
    }

    if (statColumns.some((column) => column.statId === 0) && pagedPlayers.length > 0) {
      pagedPlayers = await Promise.all(
        pagedPlayers.map(async (player) => {
          const stats = player.stats;
          const existingGp = stats?.stat_0;
          const hasGp =
            existingGp !== undefined &&
            existingGp !== null &&
            existingGp !== "" &&
            existingGp !== "-";
          if (hasGp) return player;
          try {
            const seasonStats = await client.getPlayerStats(player.key, "season");
            if (!seasonStats || Object.keys(seasonStats).length === 0) return player;
            const mergedStats: Record<string, number | string> = { ...(stats || {}) };
            Object.entries(seasonStats).forEach(([key, value]) => {
              const existing = mergedStats[key];
              if (
                existing === undefined ||
                existing === null ||
                existing === "" ||
                existing === "-"
              ) {
                mergedStats[key] = value;
              }
            });
            return {
              ...player,
              stats: mergedStats,
            };
          } catch (error) {
            console.error("Error fetching player GP stats:", error);
            return player;
          }
        })
      );
    }
  } catch (error) {
    console.error("Error fetching free agents:", error);
  }
  

   
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Free Agents
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Browse available players to add to your roster
        </p>
      </div>

      {/* Filters (Client Component) */}
      <FreeAgentFilters 
        initialSearch={q} 
        initialPosition={position} 
        initialStatus={status}
        initialHealthyOnly={healthy === "1"}
        initialHasGameToday={hasGameToday}
        initialCompoundStats={compoundStatsList}
        statOptions={statOptions}
      />

      {/* Player Table with integrated pagination */}
      <FreeAgentsTable 
        players={pagedPlayers} 
        gamesRemainingMap={gamesRemainingMap}
        todaysGames={todaysGames || new Map()} 
        statColumns={statColumns}
        sortColumn={sort}
        pageStart={pageStart}
        pageCount={pageCount}
        hasNextPage={hasNextPage}
        leagueKey={leagueKey}
        isSearch={!!q}
      />

      {/* Streaming Suggestions */}
      {streamingSuggestions.length > 0 && weekRange && (
        <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Streaming Suggestions
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                Best schedules for {weekRange.startDate} - {weekRange.endDate}
              </p>
            </div>
          </div>
          <StreamerList suggestions={streamingSuggestions} />
        </div>
      )}

    </div>
  );
}
