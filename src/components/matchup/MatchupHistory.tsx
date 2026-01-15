"use client";

import { SimplifiedMatchup } from "@/lib/yahoo/types";
import { Trophy, X } from "lucide-react";

interface MatchupHistoryProps {
  matchups: SimplifiedMatchup[];
  myTeamKey: string;
}

export function MatchupHistory({ matchups, myTeamKey }: MatchupHistoryProps) {
  // Sort by week ascending
  const sortedMatchups = [...matchups].sort((a, b) => a.week - b.week);

  const getResult = (matchup: SimplifiedMatchup): "win" | "loss" | "tie" | null => {
    if (matchup.status !== "completed") return null;
    if (!matchup.winnerTeamKey) return null;
    if (matchup.winnerTeamKey === myTeamKey) return "win";
    return "loss";
  };

  const getCategoryScore = (matchup: SimplifiedMatchup): { wins: number; losses: number; ties: number } => {
    if (!matchup.statWinners) return { wins: 0, losses: 0, ties: 0 };
    const w = Object.values(matchup.statWinners);
    return {
      wins: w.filter(v => v === "win").length,
      losses: w.filter(v => v === "loss").length,
      ties: w.filter(v => v === "tie").length,
    };
  };

  if (matchups.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Matchup History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-3 p-4 min-w-max">
          {sortedMatchups.map((matchup) => {
            const result = getResult(matchup);
            const score = getCategoryScore(matchup);

            return (
              <div
                key={matchup.week}
                className={`flex-shrink-0 w-36 p-3 rounded-lg border transition-colors ${
                  result === "win"
                    ? "bg-green-500/10 border-green-500/30"
                    : result === "loss"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--text-tertiary)]">
                    Week {matchup.week}
                  </span>
                  {result === "win" && <Trophy className="w-3.5 h-3.5 text-green-500" />}
                  {result === "loss" && <X className="w-3.5 h-3.5 text-red-500" />}
                  {matchup.status === "in_progress" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500 font-medium">LIVE</span>
                  )}
                </div>
                
                <div className="text-xs text-[var(--text-secondary)] truncate mb-1.5">
                  vs {matchup.opponent.name}
                </div>
                
                {matchup.status === "completed" && (
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span className="text-green-500">{score.wins}</span>
                    <span className="text-[var(--text-tertiary)]">-</span>
                    <span className="text-red-500">{score.losses}</span>
                    {score.ties > 0 && (
                      <>
                        <span className="text-[var(--text-tertiary)]">-</span>
                        <span className="text-yellow-500">{score.ties}</span>
                      </>
                    )}
                  </div>
                )}
                
                {matchup.status === "upcoming" && (
                  <span className="text-[10px] text-[var(--text-tertiary)]">Upcoming</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
