import { SimplifiedPlayer } from "@/lib/yahoo/types";
import { getBalldontlieTeamId } from "@/lib/nba/teamMapping";

export interface StreamingSuggestion {
  player: SimplifiedPlayer;
  gamesThisWeek: number;
  score: number;
}

export function buildGamesByTeamId(games: { home_team: { id: number }; visitor_team: { id: number } }[]) {
  const map = new Map<number, number>();
  games.forEach((game) => {
    map.set(game.home_team.id, (map.get(game.home_team.id) || 0) + 1);
    map.set(game.visitor_team.id, (map.get(game.visitor_team.id) || 0) + 1);
  });
  return map;
}

export function getGamesForPlayer(player: SimplifiedPlayer, gamesByTeamId: Map<number, number>): number {
  const teamId = player.teamAbbr ? getBalldontlieTeamId(player.teamAbbr) : undefined;
  return teamId ? gamesByTeamId.get(teamId) || 0 : 0;
}

export function getStreamingSuggestions(
  players: SimplifiedPlayer[],
  gamesByTeamId: Map<number, number>,
  limit: number = 12
): StreamingSuggestion[] {
  return players
    .map((player) => {
      const gamesThisWeek = getGamesForPlayer(player, gamesByTeamId);
      const score = gamesThisWeek;
      return { player, gamesThisWeek, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
