"use client";

import { StatColumn } from "@/lib/yahoo/statColumns";
import { ArrowRightLeft, Check, ChevronDown, ChevronUp, Coins, Copy, Download, LayoutList, Trophy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface StandingTeam {
  key: string;
  name: string;
  isOwned: boolean;
  logoUrl?: string;
  rank: number | string;
  playoffSeed?: number | string;
  wins: number | string;
  losses: number | string;
  ties: number | string;
  percentage: string;
  gamesBack?: string;
  waiverPriority?: number;
  faabBalance?: string | number;
  numberOfMoves?: number;
  numberOfTrades?: number | string;
  teamStats?: Record<string, number | string>;
  manager?: {
    nickname?: string;
    image_url?: string;
    felo_score?: string;
    felo_tier?: string;
  };
}

interface SortableStandingsTableProps {
  teams: StandingTeam[];
  statColumns: StatColumn[];
  myTeamKey?: string;
  numPlayoffTeams: number;
  exportHref?: string;
}

type SortKey = "rank" | "name" | "wins" | "losses" | "percentage" | "gamesBack" | "faabBalance" | "numberOfMoves" | string;
type SortDirection = "asc" | "desc";

export function SortableStandingsTable({
  teams,
  statColumns,
  myTeamKey,
  numPlayoffTeams,
  exportHref,
}: SortableStandingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [copied, setCopied] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      // Default sort directions
      if (key === "rank" || key === "losses") {
        setSortDir("asc");
      } else {
        setSortDir("desc");
      }
    }
  };

  const sortedTeams = [...teams].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    if (sortKey.startsWith("stat_")) {
      aVal = a.teamStats?.[sortKey] ?? "";
      bVal = b.teamStats?.[sortKey] ?? "";
    } else {
      aVal = a[sortKey as keyof StandingTeam] as number | string ?? "";
      bVal = b[sortKey as keyof StandingTeam] as number | string ?? "";
    }

    // Parse numbers
    const aNum = typeof aVal === "number" ? aVal : parseFloat(String(aVal));
    const bNum = typeof bVal === "number" ? bVal : parseFloat(String(bVal));

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortDir === "asc" ? aNum - bNum : bNum - aNum;
    }

    // String comparison
    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const handleCopyToClipboard = async () => {
    const headers = [
      "Rank", "Team", "Wins", "Losses", "Ties", "Win%", "GB", "FAAB", "Moves",
      ...statColumns.slice(0, 9).map(c => c.label)
    ];

    const rows = sortedTeams.map(team => {
      const stats = statColumns.slice(0, 9).map(col => 
        col.statId && team.teamStats ? String(team.teamStats[`stat_${col.statId}`] ?? "-") : "-"
      );

      return [
        String(team.rank),
        team.name,
        String(team.wins),
        String(team.losses),
        String(team.ties),
        `${(parseFloat(team.percentage || "0") * 100).toFixed(1)}%`,
        String(team.gamesBack ?? "-"),
        String(team.faabBalance ?? "0"),
        String(team.numberOfMoves ?? "0"),
        ...stats
      ];
    });

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

  const SortHeader = ({ label, sortKeyVal, className = "" }: { label: React.ReactNode; sortKeyVal: SortKey; className?: string }) => (
    <th
      className={`px-3 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none ${className}`}
      onClick={() => handleSort(sortKeyVal)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {sortKey === sortKeyVal && (
          sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      {/* Header with Actions */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-2">
            <LayoutList className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">League Table</h2>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-3">
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
            
            {/* Divider */}
            <div className="w-px h-5 bg-[var(--border-subtle)]" />
            
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
            
            {/* Team Count */}
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums ml-1">
              {teams.length} teams
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <SortHeader label="#" sortKeyVal="rank" className="w-12 text-left pl-4" />
              <SortHeader label="Team" sortKeyVal="name" className="text-left" />
              <SortHeader label="Record" sortKeyVal="wins" className="text-center" />
              <SortHeader label="Win%" sortKeyVal="percentage" className="text-center" />
              <SortHeader label="GB" sortKeyVal="gamesBack" className="text-center" />
              <SortHeader 
                label={<Coins className="w-3.5 h-3.5" />} 
                sortKeyVal="faabBalance" 
                className="text-center" 
              />
              <SortHeader 
                label={<ArrowRightLeft className="w-3.5 h-3.5" />} 
                sortKeyVal="numberOfMoves" 
                className="text-center" 
              />
              {statColumns.slice(0, 9).map((col) => (
                <SortHeader
                  key={col.key}
                  label={col.label}
                  sortKeyVal={`stat_${col.statId}`}
                  className="text-center"
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {sortedTeams.map((team) => {
              const isMyTeam = team.key === myTeamKey || team.isOwned;
              const wins = Number(team.wins ?? 0);
              const losses = Number(team.losses ?? 0);
              const ties = Number(team.ties ?? 0);
              const rankNum = Number(team.rank);
              const isInPlayoffs = !isNaN(rankNum) && rankNum <= numPlayoffTeams;

              return (
                <tr
                  key={team.key}
                  className={`${isMyTeam ? "bg-[var(--accent)]/5" : "hover:bg-[var(--bg-subtle)]"} transition-colors`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-medium ${isInPlayoffs ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}>
                        {team.rank !== 999 ? team.rank : "-"}
                      </span>
                      {isInPlayoffs && (
                        <span title="Playoff spot">
                          <Trophy className="w-3.5 h-3.5 text-[var(--accent)]" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Team */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      {team.logoUrl ? (
                        <Image
                          src={team.logoUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium truncate ${isMyTeam ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                            {team.name}
                          </span>
                          {isMyTeam && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium flex-shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        {team.manager?.nickname && (
                          <span className="text-[11px] text-[var(--text-tertiary)]">
                            {team.manager.nickname}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Record - fix alignment with inline-flex */}
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-baseline font-medium">
                      <span className="text-green-500">{wins}</span>
                      <span className="text-[var(--text-tertiary)] mx-0.5">-</span>
                      <span className="text-red-500">{losses}</span>
                      {ties > 0 && (
                        <>
                          <span className="text-[var(--text-tertiary)] mx-0.5">-</span>
                          <span className="text-yellow-500">{ties}</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Win % */}
                  <td className="px-3 py-3 text-center">
                    <span className="text-[var(--text-primary)] font-medium">
                      {(parseFloat(team.percentage || "0") * 100).toFixed(1)}%
                    </span>
                  </td>

                  {/* Games Back */}
                  <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                    {team.gamesBack === "-" ? "-" : team.gamesBack || "-"}
                  </td>

                  {/* FAAB */}
                  <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                    ${team.faabBalance ?? 0}
                  </td>

                  {/* Moves */}
                  <td className="px-3 py-3 text-center text-[var(--text-secondary)]">
                    {team.numberOfMoves ?? 0}
                  </td>

                  {/* Stats */}
                  {statColumns.slice(0, 9).map((col) => {
                    const statValue = col.statId && team.teamStats
                      ? team.teamStats[`stat_${col.statId}`]
                      : undefined;
                    return (
                      <td key={col.key} className="px-2 py-3 text-center text-[var(--text-secondary)] tabular-nums">
                        {statValue !== undefined ? statValue : "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
