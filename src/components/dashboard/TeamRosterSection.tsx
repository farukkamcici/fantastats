"use client";

import { RosterTable } from "@/components/dashboard/RosterTable";
import { StatColumn } from "@/lib/yahoo/statColumns";
import { SimplifiedPlayer } from "@/lib/yahoo/types";
import { useState, useTransition } from "react";

interface TeamRosterSectionProps {
  players: SimplifiedPlayer[];
  statColumns: StatColumn[];
  gamesByTeamId: Record<number, number>;
  leagueKey: string;
  teamKey: string;
  currentWeek?: number;
}

export function TeamRosterSection({
  players: initialPlayers,
  statColumns,
  gamesByTeamId: gamesByTeamIdObj,
  leagueKey,
  teamKey,
  currentWeek,
}: TeamRosterSectionProps) {
  const [statPeriod, setStatPeriod] = useState<"season" | "week">("season");
  const [players, setPlayers] = useState(initialPlayers);
  const [isPending, startTransition] = useTransition();

  // Convert object back to Map for RosterTable
  const gamesByTeamId = new Map(Object.entries(gamesByTeamIdObj).map(([k, v]) => [Number(k), v]));

  const handleStatPeriodChange = async (period: "season" | "week") => {
    if (period === statPeriod) return;
    
    setStatPeriod(period);
    
    // Fetch new stats for the selected period
    startTransition(async () => {
      try {
        const statType = period === "week" ? `week` : "season";
        const weekParam = period === "week" && currentWeek ? `&week=${currentWeek}` : "";
        
        // Fetch updated roster with new stat period
        const response = await fetch(
          `/api/yahoo/roster/${teamKey}?statType=${statType}${weekParam}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.players) {
            setPlayers(data.players);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    });
  };

  return (
    <div className={isPending ? "opacity-70 pointer-events-none transition-opacity" : ""}>
      <RosterTable
        players={players}
        statColumns={statColumns}
        gamesByTeamId={gamesByTeamId}
        statPeriod={statPeriod}
        onStatPeriodChange={handleStatPeriodChange}
      />
    </div>
  );
}

