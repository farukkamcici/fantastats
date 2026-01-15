import { SimplifiedPlayer } from "@/lib/yahoo/types";
import { getBalldontlieTeamId } from "@/lib/nba/teamMapping";

export interface LineupSuggestion {
  player: SimplifiedPlayer;
  gamesThisWeek: number;
}

export function getOptimalLineupByGames(
  players: SimplifiedPlayer[],
  gamesByTeamId: Map<number, number>,
  limit: number = 10
): LineupSuggestion[] {
  return players
    .map((player) => {
      const teamId = player.teamAbbr ? getBalldontlieTeamId(player.teamAbbr) : undefined;
      const gamesThisWeek = teamId ? gamesByTeamId.get(teamId) || 0 : 0;
      return { player, gamesThisWeek };
    })
    .sort((a, b) => b.gamesThisWeek - a.gamesThisWeek)
    .slice(0, limit);
}
