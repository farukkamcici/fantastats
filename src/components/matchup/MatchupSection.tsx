"use client";

import { MatchupHistory } from "@/components/matchup/MatchupHistory";
import { StatColumn } from "@/lib/yahoo/statColumns";
import { SimplifiedMatchup } from "@/lib/yahoo/types";
import { Check, ChevronLeft, ChevronRight, Copy, Download, Swords, Trophy } from "lucide-react";
import { useState } from "react";

interface MatchupSectionProps {
  initialMatchup: SimplifiedMatchup | null;
  matchupHistory: SimplifiedMatchup[];
  statColumns: StatColumn[];
  myTeamKey: string;
  currentWeek: number;
  exportHref?: string;
  maxWeeklyAdds?: number;
}

export function MatchupSection({
  initialMatchup,
  matchupHistory,
  statColumns,
  myTeamKey,
  currentWeek,
  exportHref,
  maxWeeklyAdds,
}: MatchupSectionProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [copied, setCopied] = useState(false);

  const handleWeekChange = (week: number) => {
    if (week >= 1 && week <= currentWeek) {
      setSelectedWeek(week);
    }
  };

  const displayMatchup = matchupHistory.find((m) => m.week === selectedWeek) || initialMatchup;

  const handleCopyToClipboard = async () => {
    if (!displayMatchup) return;

    // Calculate totals for games
    const myGames = displayMatchup.myTeam.remainingGames;
    const myTotalGames = myGames ? myGames.completed + myGames.live + myGames.remaining : 0;
    
    const oppGames = displayMatchup.opponent.remainingGames;
    const oppTotalGames = oppGames ? oppGames.completed + oppGames.live + oppGames.remaining : 0;

    // Calculate max adds (denominator)
    // Use maxWeeklyAdds if available, otherwise fallback to team's total
    const myMaxAdds = maxWeeklyAdds || displayMatchup.myTeam.rosterAdds?.total || 0;
    const oppMaxAdds = maxWeeklyAdds || displayMatchup.opponent.rosterAdds?.total || 0;

    const headers = ["Category", "My Team", "Opponent"];
    
    const extraRows = [
      ["Games Played", myGames ? `${myGames.completed}/${myTotalGames}` : "-", oppGames ? `${oppGames.completed}/${oppTotalGames}` : "-"],
      ["Moves Used", displayMatchup.myTeam.rosterAdds ? `${displayMatchup.myTeam.rosterAdds.used}/${myMaxAdds}` : "-", displayMatchup.opponent.rosterAdds ? `${displayMatchup.opponent.rosterAdds.used}/${oppMaxAdds}` : "-"]
    ];

    const statRows = statColumns.map(column => {
      const myValue = column.statId ? displayMatchup.myTeam.stats?.[`stat_${column.statId}`] : "-";
      const oppValue = column.statId ? displayMatchup.opponent.stats?.[`stat_${column.statId}`] : "-";
      return [column.label, String(myValue ?? "-"), String(oppValue ?? "-")];
    });

    const tsvContent = [
      headers.join("\t"),
      ...[...extraRows, ...statRows].map(row => row.join("\t"))
    ].join("\n");

    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Mini games bar component
  const MiniGamesBar = ({ team }: { team: SimplifiedMatchup["myTeam"] }) => {
    if (!team.remainingGames) return null;
    const total = team.remainingGames.completed + team.remainingGames.live + team.remainingGames.remaining;
    if (total === 0) return null;
    
    return (
      <div className="mt-1">
        <div className="h-1 w-20 mx-auto bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-[var(--accent)]"
            style={{ width: `${(team.remainingGames.completed / total) * 100}%` }}
          />
          <div 
            className="h-full bg-sky-400"
            style={{ width: `${(team.remainingGames.live / total) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
          {team.remainingGames.completed}/{total} GP
        </p>
      </div>
    );
  };

  // Truncate helper
  const truncateName = (name: string, maxLen: number) => {
    return name.length > maxLen ? name.substring(0, maxLen) + "…" : name;
  };

  return (
    <div className="space-y-6">
      {/* Combined Score + Stats Card */}
      {displayMatchup && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
          {/* Header with Week Selector & Actions */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-[var(--accent)]" />
                
                {/* Inline Week Selector */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleWeekChange(selectedWeek - 1)}
                    disabled={selectedWeek <= 1}
                    className="p-1 rounded hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                  <span className="text-sm font-semibold text-[var(--text-primary)] min-w-[70px] text-center">
                    Week {selectedWeek}
                  </span>
                  <button
                    onClick={() => handleWeekChange(selectedWeek + 1)}
                    disabled={selectedWeek >= currentWeek}
                    className="p-1 rounded hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {displayMatchup.status === "in_progress" && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">
                    Live
                  </span>
                )}
                {displayMatchup.status === "completed" && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                    Final
                  </span>
                )}
                {selectedWeek === currentWeek && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-medium">
                    Current
                  </span>
                )}
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Copy Button */}
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Copy stats to clipboard"
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
                  href={`${exportHref}&week=${selectedWeek}`}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  title="Export matchup stats to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </a>
              )}
            </div>
          </div>

          {/* Compact Score Display */}
          <div className="p-4">
            <div className="flex items-center justify-center gap-4">
              {/* My Team */}
              <div className="text-center flex-1">
                {displayMatchup.winnerTeamKey === displayMatchup.myTeam.key && (
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-3 h-3 text-green-500" />
                  </div>
                )}
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                  {truncateName(displayMatchup.myTeam.name, 18)}
                </h3>
                <p className={`text-2xl font-bold mt-0.5 ${
                  displayMatchup.winnerTeamKey === displayMatchup.myTeam.key
                    ? "text-green-500"
                    : "text-[var(--text-primary)]"
                }`}>
                  {displayMatchup.myTeam.points ?? "-"}
                </p>
                <MiniGamesBar team={displayMatchup.myTeam} />
                {displayMatchup.myTeam.rosterAdds && maxWeeklyAdds !== undefined && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    Moves: {displayMatchup.myTeam.rosterAdds.used}/{maxWeeklyAdds}
                  </p>
                )}
              </div>

              {/* VS */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)]">VS</span>
                </div>
              </div>

              {/* Opponent */}
              <div className="text-center flex-1">
                {displayMatchup.winnerTeamKey === displayMatchup.opponent.key && (
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-3 h-3 text-green-500" />
                  </div>
                )}
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                  {truncateName(displayMatchup.opponent.name, 18)}
                </h3>
                <p className={`text-2xl font-bold mt-0.5 ${
                  displayMatchup.winnerTeamKey === displayMatchup.opponent.key
                    ? "text-green-500"
                    : "text-[var(--text-primary)]"
                }`}>
                  {displayMatchup.opponent.points ?? "-"}
                </p>
                <MiniGamesBar team={displayMatchup.opponent} />
                {displayMatchup.opponent.rosterAdds && maxWeeklyAdds !== undefined && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    Moves: {displayMatchup.opponent.rosterAdds.used}/{maxWeeklyAdds}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          {displayMatchup.myTeam.stats && (
            <div className="border-t border-[var(--border-subtle)]" />
          )}

          {/* Integrated Stat Categories - Vertical List */}
          {displayMatchup.myTeam.stats && (
            <StatCategoryList
              matchup={displayMatchup}
              statColumns={statColumns}
            />
          )}
        </div>
      )}

      {/* Matchup History */}
      {matchupHistory.length > 1 && (
        <MatchupHistory
          matchups={matchupHistory}
          myTeamKey={myTeamKey}
        />
      )}
    </div>
  );
}

// Vertical centered stat category list
function StatCategoryList({ 
  matchup, 
  statColumns 
}: { 
  matchup: SimplifiedMatchup; 
  statColumns: StatColumn[];
}) {
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

  const myWins = Object.values(statWinners || {}).filter((v) => v === "win").length;
  const oppWins = Object.values(statWinners || {}).filter((v) => v === "loss").length;
  const ties = Object.values(statWinners || {}).filter((v) => v === "tie").length;

  // Truncate helper
  const truncateName = (name: string, maxLen: number) => {
    return name.length > maxLen ? name.substring(0, maxLen) + "…" : name;
  };

  return (
    <div className="px-4 py-3">
      {/* Vertical Stat List */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {statColumns.map((column) => {
          const status = column.statId ? getWinnerStatus(column.statId) : null;
          const myValue = column.statId ? getStatValue(myTeam.stats, column.statId) : "-";
          const oppValue = column.statId ? getStatValue(opponent.stats, column.statId) : "-";

          return (
            <div
              key={column.key}
              className="flex items-center justify-between py-2 text-sm"
            >
              {/* My Value */}
              <span className={`flex-1 text-left tabular-nums ${
                status === "win" ? "text-green-500 font-semibold" : "text-[var(--text-secondary)]"
              }`}>
                {myValue}
              </span>

              {/* Category Name (centered) */}
              <span className={`flex-shrink-0 px-3 text-xs font-medium text-center min-w-[60px] ${
                status === "win"
                  ? "text-green-500"
                  : status === "loss"
                  ? "text-red-500"
                  : status === "tie"
                  ? "text-yellow-500"
                  : "text-[var(--text-tertiary)]"
              }`}>
                {column.label}
              </span>

              {/* Opponent Value */}
              <span className={`flex-1 text-right tabular-nums ${
                status === "loss" ? "text-green-500 font-semibold" : "text-[var(--text-secondary)]"
              }`}>
                {oppValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
