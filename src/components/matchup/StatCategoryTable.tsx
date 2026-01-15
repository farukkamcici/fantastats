"use client";

import { StatColumn } from "@/lib/yahoo/statColumns";
import { SimplifiedMatchup } from "@/lib/yahoo/types";
import { Minus, Trophy } from "lucide-react";

interface StatCategoryTableProps {
  matchup: SimplifiedMatchup;
  statColumns: StatColumn[];
}

export function StatCategoryTable({ matchup, statColumns }: StatCategoryTableProps) {
  const { myTeam, opponent, statWinners } = matchup;

  const getStatValue = (stats: Record<string, number | string> | undefined, statId: number): string => {
    if (!stats) return "-";
    const value = stats[`stat_${statId}`];
    if (value === undefined || value === null) return "-";
    return String(value);
  };

  const getWinnerStatus = (statId: number): "win" | "loss" | "tie" | null => {
    if (!statWinners) return null;
    return statWinners[String(statId)] || null;
  };

  // Count category wins
  const myWins = Object.values(statWinners || {}).filter((v) => v === "win").length;
  const oppWins = Object.values(statWinners || {}).filter((v) => v === "loss").length;
  const ties = Object.values(statWinners || {}).filter((v) => v === "tie").length;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Stat Categories
        </h2>
        {statWinners && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-500 font-medium">{myWins} W</span>
            <span className="text-[var(--text-tertiary)]">-</span>
            <span className="text-red-500 font-medium">{oppWins} L</span>
            {ties > 0 && (
              <>
                <span className="text-[var(--text-tertiary)]">-</span>
                <span className="text-yellow-500 font-medium">{ties} T</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-subtle)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-tertiary)]">
                Category
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-tertiary)]">
                {myTeam.name.length > 15 ? myTeam.name.substring(0, 15) + "..." : myTeam.name}
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-tertiary)]">
                {opponent.name.length > 15 ? opponent.name.substring(0, 15) + "..." : opponent.name}
              </th>
              <th className="w-12 px-2 py-3 text-center font-medium text-[var(--text-tertiary)]">
                
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {statColumns.map((column) => {
              const status = column.statId ? getWinnerStatus(column.statId) : null;
              const myValue = column.statId ? getStatValue(myTeam.stats, column.statId) : "-";
              const oppValue = column.statId ? getStatValue(opponent.stats, column.statId) : "-";

              return (
                <tr key={column.key} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                    {column.label}
                  </td>
                  <td className={`px-4 py-3 text-center tabular-nums font-medium ${
                    status === "win" ? "text-green-500" : 
                    status === "loss" ? "text-[var(--text-secondary)]" : 
                    "text-[var(--text-primary)]"
                  }`}>
                    {myValue}
                  </td>
                  <td className={`px-4 py-3 text-center tabular-nums font-medium ${
                    status === "loss" ? "text-green-500" : 
                    status === "win" ? "text-[var(--text-secondary)]" : 
                    "text-[var(--text-primary)]"
                  }`}>
                    {oppValue}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {status === "win" && (
                      <Trophy className="w-4 h-4 text-green-500 mx-auto" />
                    )}
                    {status === "loss" && (
                      <Trophy className="w-4 h-4 text-red-500 mx-auto opacity-50" />
                    )}
                    {status === "tie" && (
                      <Minus className="w-4 h-4 text-yellow-500 mx-auto" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
