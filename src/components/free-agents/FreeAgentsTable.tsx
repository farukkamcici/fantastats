"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBalldontlieTeamId } from "@/lib/nba/teamMapping";
import { StatColumn } from "@/lib/yahoo/statColumns";
import { COMPOUND_STAT_MAPPING } from "@/lib/yahoo/statMapping";
import { SimplifiedPlayer } from "@/lib/yahoo/types";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface FreeAgentsTableProps {
  players: SimplifiedPlayer[];
  gamesRemainingMap: Map<number, number>;
  todaysGames: Map<number, string>;
  statColumns: StatColumn[];
  sortColumn?: string;
  // Pagination props
  pageStart: number;
  pageCount: number;
  hasNextPage?: boolean;
  leagueKey: string;
  isSearch?: boolean;
}

const COMPOUND_STAT_IDS = new Set(
  Object.keys(COMPOUND_STAT_MAPPING).map((statId) => Number(statId))
);
const RGTW_SORT_KEY = "RGTW";

export function FreeAgentsTable({
  players,
  gamesRemainingMap,
  todaysGames,
  statColumns,
  sortColumn,
  pageStart,
  pageCount,
  hasNextPage,
  leagueKey,
  isSearch = false,
}: FreeAgentsTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortKeys = (searchParams.get("sort") || sortColumn || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  const compoundStatIdsFromUrl = (searchParams.get("compoundStats") || "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id));
  const activeStatIds = new Set<number>([
    ...sortKeys.map((key) => Number(key)).filter((id) => Number.isFinite(id)),
    ...compoundStatIdsFromUrl,
  ]);
  const displayColumns = statColumns.filter(
    (col) =>
      !COMPOUND_STAT_IDS.has(col.statId ?? -1) &&
      ![3, 6].includes(col.statId ?? -1)
  );

  // Build URL with sort and reset to page 1
  const getSortUrl = (column: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get("sort");
    const sortList = currentSort
      ? currentSort.split(",").map((key) => key.trim()).filter(Boolean)
      : [];
    const existingIndex = sortList.indexOf(column);
    const statId = Number(column);
    const isNumericStat = Number.isFinite(statId);
    const compoundList = (params.get("compoundStats") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const compoundIndex = isNumericStat ? compoundList.indexOf(String(statId)) : -1;

    // Toggle logic:
    // - If already active (either in normal sort OR in compound stats), remove from both.
    // - Otherwise append to normal sort as a tiebreaker.
    if (existingIndex >= 0 || compoundIndex >= 0) {
      if (existingIndex >= 0) sortList.splice(existingIndex, 1);
      if (compoundIndex >= 0) compoundList.splice(compoundIndex, 1);
    } else {
      sortList.push(column);
    }

    if (sortList.length === 0) {
      params.delete("sort");
    } else {
      params.set("sort", sortList.join(","));
    }

    if (compoundList.length === 0) {
      params.delete("compoundStats");
    } else {
      params.set("compoundStats", compoundList.join(","));
    }
    
    params.delete("start"); // Reset to first page when sorting
    return `${pathname}?${params.toString()}`;
  };

  // Build pagination URL
  const getPaginationUrl = (newStart: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("start", newStart.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getResetSortUrl = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("sort");
    params.delete("sortType");
    params.delete("compoundSort");
    params.delete("compoundA");
    params.delete("compoundB");
    params.delete("compoundOrder");
    params.delete("compoundStats");
    params.delete("start");
    return `${pathname}?${params.toString()}`;
  };

  const getSortIcon = (column: string) => {
    if (column === RGTW_SORT_KEY || column === "NAME") {
      if (!sortKeys.includes(column)) {
        return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
      }
      return <ChevronDown className="w-3 h-3 text-[var(--accent)]" />;
    }

    const statId = Number(column);
    if (Number.isFinite(statId) && activeStatIds.has(statId)) {
      return <ChevronDown className="w-3 h-3 text-[var(--accent)]" />;
    }

    if (!sortKeys.includes(column)) {
      return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    }
    // Since we only support DESC (API default) or Off, only show Down arrow when active
    return <ChevronDown className="w-3 h-3 text-[var(--accent)]" />;
  };

  const canGoPrev = pageStart > 0;
  const canGoNext = hasNextPage ?? players.length >= pageCount;
  const hasSort = sortKeys.length > 0 || compoundStatIdsFromUrl.length > 0;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      {/* Header with Pagination */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="text-sm text-[var(--text-secondary)]">
          Showing {pageStart + 1} - {pageStart + players.length}
        </div>
        
        {!isSearch && (
          <div className="flex items-center gap-2">
            <Link
              href={getResetSortUrl()}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium shadow-inner transition-colors ${
                hasSort
                  ? "border-[var(--border-default)] text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)]"
                  : "border-[var(--border-subtle)] text-[var(--text-tertiary)] bg-[var(--bg-subtle)] pointer-events-none"
              }`}
            >
              Reset Sort
            </Link>
            <Link
              href={getPaginationUrl(Math.max(pageStart - pageCount, 0))}
              className={`p-1.5 rounded-lg border transition-colors ${
                canGoPrev
                  ? "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] pointer-events-none opacity-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link
              href={getPaginationUrl(pageStart + pageCount)}
              className={`p-1.5 rounded-lg border transition-colors ${
                canGoNext
                  ? "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] pointer-events-none opacity-50"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
            <tr>
              {/* Player */}
              <th className={`min-w-[180px] px-3 py-3 text-left font-medium ${sortKeys.includes("NAME") ? "bg-[var(--bg-elevated)]" : ""}`}>
                 <Link href={getSortUrl("NAME")} className={`flex items-center gap-1 hover:text-[var(--accent)] transition-colors ${sortKeys.includes("NAME") ? "text-[var(--accent)]" : ""}`}>
                   <span>Player</span>
                   {getSortIcon("NAME")}
                 </Link>
              </th>

              {/* Opp Today */}
              <th className="w-20 px-2 py-3 text-center font-medium">
                Opp Today
              </th>

              {/* Status */}
              <th className="w-24 px-2 py-3 text-center font-medium">
                <span>Status</span>
              </th>

              {/* RGTW */}
              <th className={`w-16 px-2 py-3 text-center font-medium ${sortKeys.includes(RGTW_SORT_KEY) ? "bg-[var(--bg-elevated)]" : ""}`}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={getSortUrl(RGTW_SORT_KEY)}
                        className={`flex items-center justify-center gap-1 hover:text-[var(--accent)] transition-colors ${sortKeys.includes(RGTW_SORT_KEY) ? "text-[var(--accent)]" : ""}`}
                      >
                        <span className="border-b border-dotted border-[var(--text-tertiary)] cursor-help">
                          RGTW
                        </span>
                        {getSortIcon(RGTW_SORT_KEY)}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remaining Games This Week</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </th>
              

              {/* Dynamic Stat Columns */}
              {displayColumns.map((col) => (
                <th
                  key={col.key}
                  className={`min-w-[72px] px-2 py-3 text-center font-medium ${
                    col.statId !== undefined && col.statId !== null && activeStatIds.has(col.statId)
                      ? "bg-[var(--bg-elevated)]"
                      : ""
                  }`}
                >
                  <Link
                    href={getSortUrl(String(col.statId))}
                    className={`flex items-center justify-center gap-0.5 hover:text-[var(--accent)] transition-colors ${
                      col.statId !== undefined && col.statId !== null && activeStatIds.has(col.statId)
                        ? "text-[var(--accent)]"
                        : ""
                    }`}
                    title={col.label}
                  >
                    <span className="whitespace-normal">{col.label}</span>
                    {getSortIcon(String(col.statId))}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {players.length === 0 ? (
              <tr>
                <td colSpan={4 + displayColumns.length} className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)]">
                  No free agents found.
                </td>
              </tr>
            ) : (
              players.map((player) => {
                 const nbaTeamId = player.teamAbbr ? getBalldontlieTeamId(player.teamAbbr) : undefined;
                 const gamesLeft = nbaTeamId ? gamesRemainingMap.get(nbaTeamId) || 0 : 0;
                 const opponent = nbaTeamId ? todaysGames.get(nbaTeamId) : "-";
                 const isWaiver = player.isOnWaivers === true;

                 return (
                  <tr key={player.key} className="hover:bg-[var(--bg-subtle)] transition-colors group">
                    {/* Player Info */}
                    <td className="px-3 py-2.5 text-left">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                             {player.imageUrl ? (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img src={player.imageUrl} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                             )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                               <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                                 {player.name}
                               </p>
                               {player.status === "INJ" || player.status === "O" ? (
                                 <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none bg-[var(--error-muted)] text-[var(--error)]">
                                    {player.status}
                                 </span>
                               ) : null}
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)]">
                               {player.teamAbbr} • {player.position}
                            </p>
                          </div>
                       </div>
                    </td>

                    {/* Opp Today */}
                    <td className="px-2 py-2.5 text-center text-xs text-[var(--text-secondary)]">
                      {opponent || "-"}
                    </td>

                    {/* Status (FA/Waiver) */}
                    <td className="px-2 py-2.5 text-center">
                       {isWaiver ? (
                         <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">W</span>
                       ) : (
                         <span className="text-xs text-green-500 font-medium">FA</span>
                       )}
                    </td>


                    {/* RGTW Badge */}
                    <td className="px-2 py-2.5 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                           gamesLeft >= 4 ? "bg-green-500/10 text-green-500" :
                           gamesLeft === 3 ? "bg-[var(--accent)]/10 text-[var(--accent)]" :
                           gamesLeft > 0 ? "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]" :
                           "text-[var(--text-muted)]"
                        }`}>
                           {gamesLeft > 0 ? gamesLeft : "-"}
                        </span>
                    </td>
                    

                    {/* Stats */}
                    {displayColumns.map((col) => (
                      <td key={col.key} className="px-2 py-2.5 text-center text-[var(--text-secondary)] tabular-nums font-mono text-sm">
                        {getStatValue(player.stats, col)}
                      </td>
                    ))}
                  </tr>
                 );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatValue(
  stats: SimplifiedPlayer["stats"],
  column: StatColumn
): string {
  if (!stats || column.statId === undefined || column.statId === null) return "-";
  
  // Regular stat - key-value format
  const statKey = `stat_${column.statId}`;
  let value: number | string | undefined = stats[statKey];
  if (value === undefined || value === null || value === "" || value === "-") {
    value = getSplitCompoundValue(stats, column.statId);
  }
  if (value === undefined || value === null || value === "" || value === "-") return "-";
  
  // Format based on stat type
  if (typeof value === "number") {
    const label = column.label || "";
    // Check if it's a percentage stat
    if (label.includes("%") || [5, 8, 11].includes(column.statId)) {
      return value < 1 ? value.toFixed(3) : value.toFixed(1);
    }
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }
  
  return String(value);
}

function getSplitCompoundValue(
  stats: SimplifiedPlayer["stats"],
  statId: number
): number | string | undefined {
  for (const [compoundIdRaw, mapping] of Object.entries(COMPOUND_STAT_MAPPING)) {
    const { firstStatId, secondStatId } = mapping;
    if (statId !== firstStatId && statId !== secondStatId) continue;

    const compoundKey = `stat_${compoundIdRaw}`;
    const compoundValue = stats?.[compoundKey];
    if (typeof compoundValue !== "string") return undefined;

    const parts = compoundValue.split("/");
    if (parts.length !== 2) return undefined;

    const selected = statId === firstStatId ? parts[0] : parts[1];
    const trimmed = selected.trim();
    if (!trimmed || trimmed === "-") return undefined;

    const numeric = parseFloat(trimmed);
    return Number.isNaN(numeric) ? trimmed : numeric;
  }

  return undefined;
}
