"use client";

import { SimplifiedMatchupTeam } from "@/lib/yahoo/types";

interface GamesTrackerProps {
  myTeam: SimplifiedMatchupTeam;
  opponent: SimplifiedMatchupTeam;
}

export function GamesTracker({ myTeam, opponent }: GamesTrackerProps) {
  const getTotal = (team: SimplifiedMatchupTeam) => {
    if (!team.remainingGames) return 0;
    return team.remainingGames.completed + team.remainingGames.live + team.remainingGames.remaining;
  };

  const myTotal = getTotal(myTeam);
  const oppTotal = getTotal(opponent);

  if (!myTeam.remainingGames && !opponent.remainingGames) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        Games This Week
      </h3>
      
      <div className="space-y-4">
        {/* My Team */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[var(--text-secondary)] font-medium truncate max-w-[150px]">
              {myTeam.name}
            </span>
            <span className="text-[var(--text-tertiary)]">
              {myTeam.remainingGames?.completed ?? 0}/{myTotal} games
            </span>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
            {myTeam.remainingGames && myTotal > 0 && (
              <>
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(myTeam.remainingGames.completed / myTotal) * 100}%` }}
                />
                <div 
                  className="h-full bg-yellow-500 animate-pulse transition-all"
                  style={{ width: `${(myTeam.remainingGames.live / myTotal) * 100}%` }}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-[var(--text-tertiary)]">
            <span>{myTeam.remainingGames?.completed ?? 0} done</span>
            {(myTeam.remainingGames?.live ?? 0) > 0 && (
              <span className="text-yellow-500">{myTeam.remainingGames?.live} live</span>
            )}
            <span>{myTeam.remainingGames?.remaining ?? 0} left</span>
          </div>
        </div>

        {/* Opponent */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[var(--text-secondary)] font-medium truncate max-w-[150px]">
              {opponent.name}
            </span>
            <span className="text-[var(--text-tertiary)]">
              {opponent.remainingGames?.completed ?? 0}/{oppTotal} games
            </span>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
            {opponent.remainingGames && oppTotal > 0 && (
              <>
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(opponent.remainingGames.completed / oppTotal) * 100}%` }}
                />
                <div 
                  className="h-full bg-yellow-500 animate-pulse transition-all"
                  style={{ width: `${(opponent.remainingGames.live / oppTotal) * 100}%` }}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-[var(--text-tertiary)]">
            <span>{opponent.remainingGames?.completed ?? 0} done</span>
            {(opponent.remainingGames?.live ?? 0) > 0 && (
              <span className="text-yellow-500">{opponent.remainingGames?.live} live</span>
            )}
            <span>{opponent.remainingGames?.remaining ?? 0} left</span>
          </div>
        </div>
      </div>
    </div>
  );
}
