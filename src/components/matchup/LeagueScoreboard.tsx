"use client";

import { YahooMatchup } from "@/lib/yahoo/types";
import { Swords, Trophy } from "lucide-react";

interface LeagueScoreboardProps {
  matchups: YahooMatchup[];
  myTeamKey?: string;
  currentWeek: number;
}

export function LeagueScoreboard({ matchups, myTeamKey, currentWeek }: LeagueScoreboardProps) {
  if (!matchups || matchups.length === 0) {
    return null;
  }

  const getTeamPoints = (team: YahooMatchup["teams"][number]): string => {
    if (!team.team_points?.total) return "-";
    return team.team_points.total;
  };

  const isMyMatchup = (matchup: YahooMatchup): boolean => {
    if (!myTeamKey) return false;
    return matchup.teams.some((t) => t.team.team_key === myTeamKey);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <Swords className="w-5 h-5 text-[var(--accent)]" />
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          League Scoreboard
        </h2>
        <span className="ml-auto text-sm text-[var(--text-tertiary)]">
          Week {currentWeek}
        </span>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {matchups.map((matchup, index) => {
          const team1 = matchup.teams[0];
          const team2 = matchup.teams[1];
          const isMyGame = isMyMatchup(matchup);
          const team1Points = getTeamPoints(team1);
          const team2Points = getTeamPoints(team2);
          
          const team1IsWinner = matchup.winner_team_key === team1?.team.team_key;
          const team2IsWinner = matchup.winner_team_key === team2?.team.team_key;
          const isCompleted = matchup.status === "postevent";
          const isLive = matchup.status === "midevent";

          return (
            <div
              key={index}
              className={`p-4 ${isMyGame ? "bg-[var(--accent)]/5" : ""} hover:bg-[var(--bg-subtle)] transition-colors`}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Team 1 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {team1?.team.team_logos?.[0]?.team_logo?.url && (
                      <img 
                        src={team1.team.team_logos[0].team_logo.url} 
                        alt="" 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className={`text-sm font-medium truncate ${
                      team1IsWinner ? "text-green-500" : "text-[var(--text-primary)]"
                    }`}>
                      {team1?.team.name}
                    </span>
                    {team1IsWinner && <Trophy className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-lg font-bold tabular-nums ${
                    team1IsWinner ? "text-green-500" : "text-[var(--text-primary)]"
                  }`}>
                    {team1Points}
                  </span>
                  
                  <div className="flex flex-col items-center">
                    {isLive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500 font-medium">
                        LIVE
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-tertiary)] font-medium">
                        FINAL
                      </span>
                    )}
                    {!isLive && !isCompleted && (
                      <span className="text-xs text-[var(--text-tertiary)]">vs</span>
                    )}
                  </div>
                  
                  <span className={`text-lg font-bold tabular-nums ${
                    team2IsWinner ? "text-green-500" : "text-[var(--text-primary)]"
                  }`}>
                    {team2Points}
                  </span>
                </div>

                {/* Team 2 */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {team2IsWinner && <Trophy className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                    <span className={`text-sm font-medium truncate ${
                      team2IsWinner ? "text-green-500" : "text-[var(--text-primary)]"
                    }`}>
                      {team2?.team.name}
                    </span>
                    {team2?.team.team_logos?.[0]?.team_logo?.url && (
                      <img 
                        src={team2.team.team_logos[0].team_logo.url} 
                        alt="" 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
