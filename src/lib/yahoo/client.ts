/**
 * Yahoo Fantasy Sports API Client
 * 
 * Handles all communication with Yahoo Fantasy API.
 * Includes caching via Upstash Redis.
 */

import { cache, CACHE_TTL, cacheKey } from "@/lib/redis";
import {
    SimplifiedLeague,
    SimplifiedMatchup,
    SimplifiedPlayer,
    SimplifiedTeam,
    YahooLeague,
    YahooScoreboard,
    YahooStandings,
    YahooTeam
} from "./types";

// =============================================================================
// CONSTANTS
// =============================================================================

const YAHOO_API_BASE = "https://fantasysports.yahooapis.com/fantasy/v2";

// Current NBA game key (updates each season)
// 2024-25 season = 454 (you may need to update this)
const NBA_GAME_KEY = "nba"; // Use 'nba' for current season

// =============================================================================
// API CLIENT CLASS
// =============================================================================

export class YahooFantasyClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // ===========================================================================
  // BASE REQUEST METHOD
  // ===========================================================================

  private async request<T>(
    endpoint: string,
    options: {
      format?: "json" | "xml";
      useCache?: boolean;
      cacheTtl?: number;
      cacheKeyOverride?: string;
    } = {}
  ): Promise<T> {
    const { format = "json", useCache = true, cacheTtl, cacheKeyOverride } = options;

    // Build URL
    const url = `${YAHOO_API_BASE}${endpoint}${
      endpoint.includes("?") ? "&" : "?"
    }format=${format}`;

    // Check cache first
    if (useCache) {
      const key = cacheKeyOverride || `yahoo:${endpoint}`;
      const cached = await cache.get<T>(key);
      if (cached) {
        return cached;
      }
    }

    // Make request
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Yahoo API Error:", response.status, errorText);
      throw new YahooApiError(
        `Yahoo API request failed: ${response.status}`,
        response.status,
        errorText
      );
    }

    const data = await response.json();

    // Cache the result
    if (useCache) {
      const key = cacheKeyOverride || `yahoo:${endpoint}`;
      const ttl = cacheTtl || CACHE_TTL.STANDINGS; // Default 1 hour
      await cache.set(key, data, ttl);
    }

    return data;
  }

  // ===========================================================================
  // USER & LEAGUES
  // ===========================================================================

  /**
   * Get all NBA leagues for the current user
   */
  async getMyLeagues(): Promise<SimplifiedLeague[]> {
    const endpoint = `/users;use_login=1/games;game_keys=${NBA_GAME_KEY}/leagues`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: cacheKey.leagues("me"),
        cacheTtl: CACHE_TTL.SETTINGS,
      });

      return this.parseLeaguesResponse(response);
    } catch (error) {
      console.error("Error fetching leagues:", error);
      throw error;
    }
  }

  /**
   * Get detailed league info including settings
   */
  async getLeague(leagueKey: string): Promise<YahooLeague | null> {
    const endpoint = `/league/${leagueKey};out=settings,standings,scoreboard`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: cacheKey.leagueSettings(leagueKey),
        cacheTtl: CACHE_TTL.SETTINGS,
      });

      return this.parseLeagueResponse(response);
    } catch (error) {
      console.error("Error fetching league:", error);
      throw error;
    }
  }

  /**
   * Get league standings
   */
  async getStandings(leagueKey: string): Promise<YahooStandings | null> {
    const endpoint = `/league/${leagueKey}/standings`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: `yahoo:standings:${leagueKey}`,
        cacheTtl: CACHE_TTL.STANDINGS,
      });

      return this.parseStandingsResponse(response);
    } catch (error) {
      console.error("Error fetching standings:", error);
      throw error;
    }
  }

  /**
   * Get league scoreboard (current week matchups)
   */
  async getScoreboard(leagueKey: string, week?: number): Promise<YahooScoreboard | null> {
    const weekParam = week ? `;week=${week}` : "";
    const endpoint = `/league/${leagueKey}/scoreboard${weekParam}`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: `yahoo:scoreboard:${leagueKey}:${week || "current"}`,
        cacheTtl: CACHE_TTL.MATCHUP,
      });

      return this.parseScoreboardResponse(response);
    } catch (error) {
      console.error("Error fetching scoreboard:", error);
      throw error;
    }
  }

  // ===========================================================================
  // TEAM
  // ===========================================================================

  /**
   * Get my team in a league
   */
  async getMyTeam(leagueKey: string): Promise<SimplifiedTeam | null> {
    const endpoint = `/league/${leagueKey}/teams;is_owned=1`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: cacheKey.team("me", leagueKey),
        cacheTtl: CACHE_TTL.ROSTER,
      });

      const teams = this.parseTeamsResponse(response);
      return teams.find((t) => t.isOwned) || null;
    } catch (error) {
      console.error("Error fetching my team:", error);
      throw error;
    }
  }

  /**
   * Get all teams in a league
   */
  async getTeams(leagueKey: string): Promise<SimplifiedTeam[]> {
    const endpoint = `/league/${leagueKey}/teams`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: `yahoo:teams:${leagueKey}`,
        cacheTtl: CACHE_TTL.STANDINGS,
      });

      return this.parseTeamsResponse(response);
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }
  }

  /**
   * Get team details including roster
   */
  async getTeamWithRoster(teamKey: string): Promise<YahooTeam | null> {
    const endpoint = `/team/${teamKey};out=roster`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: cacheKey.roster(teamKey),
        cacheTtl: CACHE_TTL.ROSTER,
      });

      return this.parseTeamResponse(response);
    } catch (error) {
      console.error("Error fetching team with roster:", error);
      throw error;
    }
  }

  // ===========================================================================
  // ROSTER & PLAYERS
  // ===========================================================================

  /**
   * Get team roster for a specific week
   */
  async getRoster(teamKey: string, week?: number): Promise<SimplifiedPlayer[]> {
    const weekParam = week ? `/players;week=${week}` : "/roster/players";
    const endpoint = `/team/${teamKey}${weekParam};out=stats`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: cacheKey.roster(teamKey, week),
        cacheTtl: CACHE_TTL.ROSTER,
      });

      return this.parsePlayersResponse(response);
    } catch (error) {
      console.error("Error fetching roster:", error);
      throw error;
    }
  }

  /**
   * Get free agents in a league
   */
  async getFreeAgents(
    leagueKey: string,
    options: {
      position?: string;
      status?: "A" | "FA" | "W" | "T"; // Available, Free Agent, Waivers, Taken
      sort?: string;
      count?: number;
      start?: number;
    } = {}
  ): Promise<SimplifiedPlayer[]> {
    const { position, status = "A", sort = "OR", count = 25, start = 0 } = options;

    let endpoint = `/league/${leagueKey}/players;status=${status};sort=${sort};count=${count};start=${start}`;
    if (position) {
      endpoint += `;position=${position}`;
    }

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: cacheKey.freeAgents(leagueKey, position || "all"),
        cacheTtl: CACHE_TTL.PLAYERS,
      });

      return this.parsePlayersResponse(response);
    } catch (error) {
      console.error("Error fetching free agents:", error);
      throw error;
    }
  }

  /**
   * Search players by name
   */
  async searchPlayers(leagueKey: string, searchTerm: string): Promise<SimplifiedPlayer[]> {
    const endpoint = `/league/${leagueKey}/players;search=${encodeURIComponent(searchTerm)}`;

    try {
      const response = await this.request<any>(endpoint, {
        useCache: false, // Don't cache search results
      });

      return this.parsePlayersResponse(response);
    } catch (error) {
      console.error("Error searching players:", error);
      throw error;
    }
  }

  // ===========================================================================
  // MATCHUPS
  // ===========================================================================

  /**
   * Get my matchup for current or specific week
   */
  async getMyMatchup(teamKey: string, week?: number): Promise<SimplifiedMatchup | null> {
    const weekParam = week ? `;weeks=${week}` : "";
    const endpoint = `/team/${teamKey}/matchups${weekParam}`;
    const weekForCache = week || 0; // Use 0 to indicate "current week"

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: cacheKey.matchup(teamKey, weekForCache),
        cacheTtl: CACHE_TTL.MATCHUP,
      });

      const matchups = this.parseMatchupsResponse(response, teamKey);
      return matchups[0] || null;
    } catch (error) {
      console.error("Error fetching matchup:", error);
      throw error;
    }
  }

  /**
   * Get all matchups for the season
   */
  async getAllMatchups(teamKey: string): Promise<SimplifiedMatchup[]> {
    const endpoint = `/team/${teamKey}/matchups`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: `yahoo:allmatchups:${teamKey}`,
        cacheTtl: CACHE_TTL.STANDINGS,
      });

      return this.parseMatchupsResponse(response, teamKey);
    } catch (error) {
      console.error("Error fetching all matchups:", error);
      throw error;
    }
  }

  // ===========================================================================
  // STATS
  // ===========================================================================

  /**
   * Get player stats for a week or season
   */
  async getPlayerStats(
    playerKey: string,
    type: "week" | "season" = "season",
    week?: number
  ): Promise<Record<string, number>> {
    const statType = type === "week" && week ? `stats;type=week;week=${week}` : "stats;type=season";
    const endpoint = `/player/${playerKey}/${statType}`;

    try {
      const response = await this.request<any>(endpoint, {
        cacheKeyOverride: `yahoo:playerstats:${playerKey}:${type}:${week || "season"}`,
        cacheTtl: type === "week" ? CACHE_TTL.MATCHUP : CACHE_TTL.STANDINGS,
      });

      return this.parsePlayerStatsResponse(response);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  }

  // ===========================================================================
  // RESPONSE PARSERS (Yahoo's response format is deeply nested)
  // ===========================================================================

  private parseLeaguesResponse(response: any): SimplifiedLeague[] {
    try {
      const fantasyContent = response.fantasy_content;
      const users = fantasyContent?.users?.[0]?.user || [];
      const games = users[1]?.games || [];

      const leagues: SimplifiedLeague[] = [];

      for (const game of Object.values(games)) {
        if (typeof game !== "object" || !game) continue;
        const gameData = (game as any)?.game || [];
        const gameInfo = gameData[0];
        const leaguesData = gameData[1]?.leagues || {};

        for (const league of Object.values(leaguesData)) {
          if (typeof league !== "object" || !league) continue;
          const leagueInfo = (league as any)?.league?.[0];
          if (!leagueInfo) continue;

          leagues.push({
            key: leagueInfo.league_key,
            id: leagueInfo.league_id,
            name: leagueInfo.name,
            logoUrl: leagueInfo.logo_url,
            season: leagueInfo.season,
            currentWeek: leagueInfo.current_week,
            numTeams: leagueInfo.num_teams,
            scoringType: leagueInfo.scoring_type,
            isActive: !gameInfo?.is_game_over,
          });
        }
      }

      return leagues;
    } catch (error) {
      console.error("Error parsing leagues response:", error);
      return [];
    }
  }

  private parseLeagueResponse(response: any): YahooLeague | null {
    try {
      const fantasyContent = response.fantasy_content;
      const league = fantasyContent?.league;
      if (!league || !league[0]) return null;

      return {
        ...league[0],
        settings: league[1]?.settings?.[0],
        standings: league[1]?.standings,
        scoreboard: league[1]?.scoreboard,
      };
    } catch (error) {
      console.error("Error parsing league response:", error);
      return null;
    }
  }

  private parseStandingsResponse(response: any): YahooStandings | null {
    try {
      const fantasyContent = response.fantasy_content;
      const league = fantasyContent?.league;
      if (!league) return null;

      return league[1]?.standings || null;
    } catch (error) {
      console.error("Error parsing standings response:", error);
      return null;
    }
  }

  private parseScoreboardResponse(response: any): YahooScoreboard | null {
    try {
      const fantasyContent = response.fantasy_content;
      const league = fantasyContent?.league;
      if (!league) return null;

      return league[1]?.scoreboard || null;
    } catch (error) {
      console.error("Error parsing scoreboard response:", error);
      return null;
    }
  }

  private parseTeamsResponse(response: any): SimplifiedTeam[] {
    try {
      const fantasyContent = response.fantasy_content;
      const league = fantasyContent?.league;
      const teams = league?.[1]?.teams || {};

      const result: SimplifiedTeam[] = [];

      for (const team of Object.values(teams)) {
        if (typeof team !== "object" || !team) continue;
        const teamInfo = (team as any)?.team?.[0] || [];

        // Yahoo returns team info as array of objects with different keys
        const teamData: any = {};
        for (const item of teamInfo) {
          if (typeof item === "object") {
            Object.assign(teamData, item);
          }
        }

        if (teamData.team_key) {
          result.push({
            key: teamData.team_key,
            id: teamData.team_id,
            name: teamData.name,
            logoUrl: teamData.team_logos?.[0]?.team_logo?.url,
            isOwned: teamData.is_owned_by_current_login === 1,
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Error parsing teams response:", error);
      return [];
    }
  }

  private parseTeamResponse(response: any): YahooTeam | null {
    try {
      const fantasyContent = response.fantasy_content;
      const team = fantasyContent?.team;
      if (!team) return null;

      const teamInfo = team[0] || [];
      const teamData: any = {};
      for (const item of teamInfo) {
        if (typeof item === "object") {
          Object.assign(teamData, item);
        }
      }

      return {
        ...teamData,
        roster: team[1]?.roster,
      };
    } catch (error) {
      console.error("Error parsing team response:", error);
      return null;
    }
  }

  private parsePlayersResponse(response: any): SimplifiedPlayer[] {
    try {
      const players: SimplifiedPlayer[] = [];

      // Navigate to players array - structure varies by endpoint
      let playersData: any;

      const fantasyContent = response.fantasy_content;

      if (fantasyContent?.team) {
        // /team/{key}/roster/players
        const team = fantasyContent.team;
        playersData = team[1]?.roster?.[0]?.players || team[1]?.players;
      } else if (fantasyContent?.league) {
        // /league/{key}/players
        const league = fantasyContent.league;
        playersData = league[1]?.players;
      }

      if (!playersData) return [];

      for (const player of Object.values(playersData)) {
        if (typeof player !== "object" || !player) continue;

        const playerInfo = (player as any)?.player;
        if (!playerInfo) continue;

        const playerData: any = {};
        const playerArray = playerInfo[0] || [];

        for (const item of playerArray) {
          if (typeof item === "object") {
            if (item.name) playerData.name = item.name;
            else if (item.headshot) playerData.headshot = item.headshot;
            else if (item.eligible_positions) playerData.eligible_positions = item.eligible_positions;
            else if (item.selected_position) playerData.selected_position = item.selected_position;
            else if (item.percent_owned) playerData.percent_owned = item.percent_owned;
            else Object.assign(playerData, item);
          }
        }

        if (playerData.player_key) {
          players.push({
            key: playerData.player_key,
            id: playerData.player_id,
            name: playerData.name?.full || `${playerData.name?.first} ${playerData.name?.last}`,
            team: playerData.editorial_team_full_name || "",
            teamAbbr: playerData.editorial_team_abbr || "",
            position: playerData.display_position || playerData.primary_position || "",
            eligiblePositions:
              playerData.eligible_positions?.map((p: any) => p.position) || [],
            imageUrl: playerData.headshot?.url || playerData.image_url,
            status: playerData.status,
            statusFull: playerData.status_full,
            injuryNote: playerData.injury_note,
            selectedPosition: playerData.selected_position?.[1]?.position,
            percentOwned: playerData.percent_owned?.value,
          });
        }
      }

      return players;
    } catch (error) {
      console.error("Error parsing players response:", error);
      return [];
    }
  }

  private parseMatchupsResponse(response: any, myTeamKey: string): SimplifiedMatchup[] {
    try {
      const fantasyContent = response.fantasy_content;
      const team = fantasyContent?.team;
      if (!team) return [];

      const matchupsData = team[1]?.matchups;
      if (!matchupsData) return [];

      const matchups: SimplifiedMatchup[] = [];

      for (const matchup of Object.values(matchupsData)) {
        if (typeof matchup !== "object" || !matchup) continue;

        const matchupInfo = (matchup as any)?.matchup;
        if (!matchupInfo) continue;

        const teamsInMatchup = matchupInfo[0]?.teams || {};
        let myTeam: any = null;
        let opponent: any = null;

        for (const t of Object.values(teamsInMatchup)) {
          if (typeof t !== "object" || !t) continue;
          const teamData = (t as any)?.team?.[0] || [];

          let teamKey = "";
          for (const item of teamData) {
            if (item?.team_key) {
              teamKey = item.team_key;
              break;
            }
          }

          if (teamKey === myTeamKey) {
            myTeam = t;
          } else {
            opponent = t;
          }
        }

        if (myTeam && opponent) {
          const status = matchupInfo[0]?.status;
          matchups.push({
            week: matchupInfo[0]?.week,
            status:
              status === "postevent"
                ? "completed"
                : status === "midevent"
                ? "in_progress"
                : "upcoming",
            isPlayoffs: matchupInfo[0]?.is_playoffs === 1,
            myTeam: this.extractTeamFromMatchup(myTeam),
            opponent: this.extractTeamFromMatchup(opponent),
          });
        }
      }

      return matchups;
    } catch (error) {
      console.error("Error parsing matchups response:", error);
      return [];
    }
  }

  private extractTeamFromMatchup(teamData: any): SimplifiedMatchup["myTeam"] {
    const team = teamData?.team || [];
    const teamInfo = team[0] || [];
    const teamStats = team[1];

    let name = "";
    for (const item of teamInfo) {
      if (item?.name) {
        name = item.name;
        break;
      }
    }

    return {
      name,
      points: teamStats?.team_points?.total
        ? parseFloat(teamStats.team_points.total)
        : undefined,
      projectedPoints: teamStats?.team_projected_points?.total
        ? parseFloat(teamStats.team_projected_points.total)
        : undefined,
    };
  }

  private parsePlayerStatsResponse(response: any): Record<string, number> {
    try {
      const fantasyContent = response.fantasy_content;
      const player = fantasyContent?.player;
      if (!player) return {};

      const stats = player[1]?.player_stats?.stats || [];
      const result: Record<string, number> = {};

      for (const stat of stats) {
        if (stat?.stat) {
          result[`stat_${stat.stat.stat_id}`] = parseFloat(stat.stat.value) || 0;
        }
      }

      return result;
    } catch (error) {
      console.error("Error parsing player stats response:", error);
      return {};
    }
  }
}

// =============================================================================
// ERROR CLASS
// =============================================================================

export class YahooApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = "YahooApiError";
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createYahooClient(accessToken: string): YahooFantasyClient {
  return new YahooFantasyClient(accessToken);
}
