"use client";

import { getBalldontlieTeamId } from "@/lib/nba/teamMapping";
import { StatColumn } from "@/lib/yahoo/statColumns";
import { SimplifiedPlayer } from "@/lib/yahoo/types";
import { Calendar, Check, ChevronDown, ChevronsUpDown, ChevronUp, Copy, Download, Shirt, User } from "lucide-react";
import { useMemo, useState } from "react";

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

type StatPeriod = "season" | "week";

interface RosterTableProps {
  players: SimplifiedPlayer[];
  statColumns: StatColumn[];
  gamesByTeamId: Map<number, number>;
  onStatPeriodChange?: (period: StatPeriod) => void;
  statPeriod?: StatPeriod;
  weekRange?: { startDate: string; endDate: string } | null;
  exportHref?: string;
}

export function RosterTable({ 
  players, 
  statColumns, 
  gamesByTeamId,
  onStatPeriodChange,
  statPeriod = "season",
  weekRange,
  exportHref
}: RosterTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [copied, setCopied] = useState(false);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        // 3-way toggle: default → desc → asc → default
        if (current.direction === "desc") {
          return { key, direction: "asc" };
        }
        return null; // Clear sort (back to default)
      }
      return { key, direction: "desc" }; // Start with desc for stats
    });
  };

  // Separate IL/IL+ players from regular players for sticky behavior
  const { regularPlayers, injuredPlayers } = useMemo(() => {
    const injured: SimplifiedPlayer[] = [];
    const regular: SimplifiedPlayer[] = [];
    
    players.forEach(player => {
      if (player.selectedPosition && ["IL", "IL+"].includes(player.selectedPosition)) {
        injured.push(player);
      } else {
        regular.push(player);
      }
    });
    
    return { regularPlayers: regular, injuredPlayers: injured };
  }, [players]);

  const sortedRegularPlayers = useMemo(() => {
    if (!sortConfig) return regularPlayers;

    return [...regularPlayers].sort((a, b) => {
      let aValue: number | string | undefined;
      let bValue: number | string | undefined;

      if (sortConfig.key === "name") {
        aValue = a.name;
        bValue = b.name;
      } else if (sortConfig.key === "pos") {
        aValue = a.selectedPosition || "";
        bValue = b.selectedPosition || "";
      } else if (sortConfig.key === "games") {
        const aTeamId = a.teamAbbr ? getBalldontlieTeamId(a.teamAbbr) : undefined;
        const bTeamId = b.teamAbbr ? getBalldontlieTeamId(b.teamAbbr) : undefined;
        aValue = aTeamId ? gamesByTeamId.get(aTeamId) ?? 0 : 0;
        bValue = bTeamId ? gamesByTeamId.get(bTeamId) ?? 0 : 0;
      } else {
        // Stat column
        const statKey = sortConfig.key;
        const aStats = a.stats as Record<string, number | string> | undefined;
        const bStats = b.stats as Record<string, number | string> | undefined;
        
        aValue = getNumericStatValue(aStats, statKey);
        bValue = getNumericStatValue(bStats, statKey);
      }

      // Compare
      if (typeof aValue === "string" && typeof bValue === "string") {
        const compare = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? compare : -compare;
      }
      
      const numA = typeof aValue === "number" ? aValue : 0;
      const numB = typeof bValue === "number" ? bValue : 0;
      return sortConfig.direction === "asc" ? numA - numB : numB - numA;
    });
  }, [regularPlayers, sortConfig, gamesByTeamId]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === "asc" 
      ? <ChevronUp className="w-3 h-3 text-[var(--accent)]" />
      : <ChevronDown className="w-3 h-3 text-[var(--accent)]" />;
  };

  const allPlayers = [...sortedRegularPlayers, ...injuredPlayers];

  // Copy to clipboard function - maintains table formatting
  const handleCopyToClipboard = async () => {
    const headers = ["Pos", "Player", "Team", "G", ...statColumns.map(c => c.label)];
    
    const rows = allPlayers.map(player => {
      const teamId = player.teamAbbr ? getBalldontlieTeamId(player.teamAbbr) : undefined;
      const gamesThisWeek = teamId ? gamesByTeamId.get(teamId) : undefined;
      
      const statValues = statColumns.map(column => {
        const val = getStatValue(player.stats, column, column.label);
        return val === "-" ? "" : val;
      });
      
      return [
        player.selectedPosition || "",
        player.name,
        player.teamAbbr || "",
        gamesThisWeek?.toString() || "",
        ...statValues
      ];
    });

    // Create tab-separated format for Excel/Sheets
    const tsvContent = [
      headers.join("\t"),
      ...rows.map(row => row.join("\t"))
    ].join("\n");

    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Format week range with localized month names
  const formatWeekRange = (range: { startDate: string; endDate: string } | null | undefined) => {
    if (!range) return null;
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    
    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      {/* Header Row 1: Title + Actions */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title + Week Range */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Roster</h2>
            </div>
            
            {weekRange && (
              <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <span>{formatWeekRange(weekRange)}</span>
              </div>
            )}
          </div>
          
          {/* Right: Stats Toggle + Actions */}
          <div className="flex items-center gap-3">
            {/* Season/Week Dropdown */}
            {onStatPeriodChange && (
              <div className="relative">
                <select
                  value={statPeriod}
                  onChange={(e) => onStatPeriodChange(e.target.value as StatPeriod)}
                  className="appearance-none bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg pl-3.5 pr-10 py-2 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors min-w-[140px] min-h-[40px] shadow-sm"
                >
                  <option value="season">Season Stats</option>
                  <option value="week">Week Stats</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
              </div>
            )}
            
            {/* Divider */}
            <div className="w-px h-5 bg-[var(--border-subtle)]" />
            
            {/* Copy Button */}
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Copy table to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            
            {/* Export Button */}
            {exportHref && (
              <a
                href={exportHref}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </a>
            )}
            
            {/* Player Count */}
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
              {players.length} players
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
            <tr>
              <th 
                className="w-16 px-3 py-3 text-left font-medium cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors"
                onClick={() => handleSort("pos")}
              >
                <div className="flex items-center gap-1">
                  <span>Pos</span>
                  {getSortIcon("pos")}
                </div>
              </th>
              <th 
                className="min-w-[180px] px-3 py-3 text-left font-medium cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  <span>Player</span>
                  {getSortIcon("name")}
                </div>
              </th>
              <th 
                className="w-16 px-2 py-3 text-center font-medium cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors group relative"
                onClick={() => handleSort("games")}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="border-b border-dotted border-[var(--text-tertiary)]" title="Total games for this week">GTW</span>
                  {getSortIcon("games")}
                </div>
              </th>
              {statColumns.map((column) => (
                <th 
                  key={column.key} 
                  className="w-16 px-2 py-3 text-center font-medium cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="truncate">{column.label}</span>
                    {getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {allPlayers.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + statColumns.length}
                  className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)]"
                >
                  No roster data available yet.
                </td>
              </tr>
            ) : (
              allPlayers.map((player, index) => (
                <RosterRow
                  key={player.key}
                  player={player}
                  statColumns={statColumns}
                  gamesByTeamId={gamesByTeamId}
                  isInjured={injuredPlayers.includes(player)}
                  showDivider={index === sortedRegularPlayers.length - 1 && injuredPlayers.length > 0}
                />
              ))
            )}
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
  isInjured,
  showDivider,
}: {
  player: SimplifiedPlayer;
  statColumns: StatColumn[];
  gamesByTeamId: Map<number, number>;
  isInjured: boolean;
  showDivider: boolean;
}) {
  const hasStatus = player.status && player.status !== "H";
  const teamId = player.teamAbbr ? getBalldontlieTeamId(player.teamAbbr) : undefined;
  const gamesThisWeek = teamId ? gamesByTeamId.get(teamId) : undefined;

  return (
    <tr className={`hover:bg-[var(--bg-subtle)] transition-colors ${isInjured ? "opacity-60" : ""} ${showDivider ? "border-b-2 border-[var(--border-default)]" : ""}`}>
      <td className="px-3 py-2.5 text-left">
        <span className={`inline-flex items-center justify-center w-10 py-1 rounded text-xs font-semibold ${
          isInjured 
            ? "bg-[var(--error-muted)] text-[var(--error)]" 
            : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
        }`}>
          {player.selectedPosition || "–"}
        </span>
      </td>
      <td className="px-3 py-2.5 text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center flex-shrink-0">
            {player.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={player.imageUrl} 
                alt="" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-[var(--text-tertiary)]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {player.name}
              </p>
              {hasStatus && (
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none ${
                  player.status === "INJ" || player.status === "O" 
                    ? "bg-[var(--error-muted)] text-[var(--error)]"
                    : player.status === "GTD" || player.status === "DTD"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
                }`}>
                  {player.status}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] truncate">
              {player.teamAbbr || "—"} • {player.position || "—"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
          gamesThisWeek !== undefined && gamesThisWeek >= 4
            ? "bg-green-500/10 text-green-500"
            : gamesThisWeek !== undefined && gamesThisWeek >= 3
            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
            : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
        }`}>
          {gamesThisWeek ?? "–"}
        </span>
      </td>
      {statColumns.map((column) => (
        <td
          key={column.key}
          className="px-2 py-2.5 text-center text-[var(--text-secondary)] tabular-nums"
        >
          {getStatValue(player.stats, column, column.label)}
        </td>
      ))}
    </tr>
  );
}

function getNumericStatValue(
  stats: Record<string, number | string> | undefined,
  statKey: string
): number {
  if (!stats) return 0;
  const raw = stats[statKey];
  
  if (typeof raw === "string" && raw.includes("/")) {
    const [made] = raw.split("/");
    return parseFloat(made) || 0;
  }
  
  return typeof raw === "number" ? raw : parseFloat(String(raw)) || 0;
}

function getStatValue(
  stats: SimplifiedPlayer["stats"],
  column: StatColumn,
  label: string
) {
  if (!stats || !column.statId) return "-";
  
  // Handle compound stat IDs (like 9004003 for FGM/FGA or 9007006 for FTM/FTA)
  if (column.statId > 9000000) {
    const idStr = column.statId.toString();
    const firstStatId = parseInt(idStr.slice(1, 4), 10);
    const secondStatId = parseInt(idStr.slice(4, 7), 10);
    
    const firstValue = stats[`stat_${firstStatId}`];
    const secondValue = stats[`stat_${secondStatId}`];
    
    if (firstValue !== undefined && secondValue !== undefined) {
      return `${firstValue}/${secondValue}`;
    }
    return "-";
  }
  
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
