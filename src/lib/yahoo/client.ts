/**
 * Yahoo Fantasy Sports API Client
 *
 * Handles all communication with Yahoo Fantasy API.
 * Includes caching via Upstash Redis.
 */

import { cache, CACHE_TTL, cacheKey } from "@/lib/redis";
import {
    SimplifiedDraftPick,
    SimplifiedGame,
    SimplifiedLeague,
    SimplifiedMatchup,
    SimplifiedPlayer,
    SimplifiedTeam,
    SimplifiedTransaction,
    YahooLeague,
    YahooLeagueSettings,
    YahooScoreboard,
    YahooStandings,
    YahooTeamStanding,
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
      const response = await this.request<unknown>(endpoint, {
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
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.league(leagueKey),
        cacheTtl: CACHE_TTL.MATCHUP,
      });

      return this.parseLeagueResponse(response);
    } catch (error) {
      console.error("Error fetching league:", error);
      throw error;
    }
  }

  /**
   * Get league metadata
   */
  async getLeagueMetadata(leagueKey: string): Promise<YahooLeague | null> {
    const endpoint = `/league/${leagueKey}/metadata`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.leagueMeta(leagueKey),
        cacheTtl: CACHE_TTL.SETTINGS,
      });

      return this.parseLeagueResponse(response);
    } catch (error) {
      console.error("Error fetching league metadata:", error);
      throw error;
    }
  }

  /**
   * Get league standings
   */
  async getStandings(leagueKey: string): Promise<YahooStandings | null> {
    const endpoint = `/league/${leagueKey}/standings`;

    try {
      const response = await this.request<unknown>(endpoint, {
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
      const response = await this.request<unknown>(endpoint, {
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
      const response = await this.request<unknown>(endpoint, {
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
      const response = await this.request<unknown>(endpoint, {
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
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.teamRoster(teamKey),
        cacheTtl: CACHE_TTL.ROSTER,
      });

      return this.parseTeamResponse(response);
    } catch (error) {
      console.error("Error fetching team with roster:", error);
      throw error;
    }
  }

  /**
   * Get team info
   */
  async getTeam(teamKey: string): Promise<YahooTeam | null> {
    const endpoint = `/team/${teamKey}`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:team:${teamKey}`,
        cacheTtl: CACHE_TTL.ROSTER,
      });

      return this.parseTeamResponse(response);
    } catch (error) {
      console.error("Error fetching team:", error);
      throw error;
    }
  }

  /**
   * Get team metadata
   */
  async getTeamMetadata(teamKey: string): Promise<YahooTeam | null> {
    const endpoint = `/team/${teamKey}/metadata`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:team:metadata:${teamKey}`,
        cacheTtl: CACHE_TTL.SETTINGS,
      });

      return this.parseTeamResponse(response);
    } catch (error) {
      console.error("Error fetching team metadata:", error);
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
      const response = await this.request<unknown>(endpoint, {
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
   * Get team roster (current week)
   */
  async getRosterCurrent(teamKey: string): Promise<SimplifiedPlayer[]> {
    const endpoint = `/team/${teamKey}/roster`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:roster:${teamKey}:current`,
        cacheTtl: CACHE_TTL.ROSTER,
      });

      return this.parsePlayersResponse(response);
    } catch (error) {
      console.error("Error fetching roster (current):", error);
      throw error;
    }
  }

  /**
   * Get team roster for a specific week
   */
  async getRosterByWeek(teamKey: string, week: number): Promise<SimplifiedPlayer[]> {
    const endpoint = `/team/${teamKey}/roster;week=${week}`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.roster(teamKey, week),
        cacheTtl: CACHE_TTL.ROSTER,
      });

      return this.parsePlayersResponse(response);
    } catch (error) {
      console.error("Error fetching roster by week:", error);
      throw error;
    }
  }

  /**
   * Get team roster for a specific date (NBA daily)
   */
  async getRosterByDate(teamKey: string, date: string): Promise<SimplifiedPlayer[]> {
    const endpoint = `/team/${teamKey}/roster;date=${date}`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:roster:${teamKey}:date:${date}`,
        cacheTtl: CACHE_TTL.ROSTER,
      });

      return this.parsePlayersResponse(response);
    } catch (error) {
      console.error("Error fetching roster by date:", error);
      throw error;
    }
  }

  /**
   * Get league players (supports status/position/sort)
   */
  async getLeaguePlayers(
    leagueKey: string,
    options: {
      position?: string;
      status?: "A" | "FA" | "W" | "T";
      sort?: string;
      sortType?: "season" | "lastweek" | "lastmonth";
      count?: number;
      start?: number;
    } = {}
  ): Promise<SimplifiedPlayer[]> {
    const {
      position,
      status = "A",
      sort,
      sortType,
      count = 25,
      start = 0,
    } = options;

    let endpoint = `/league/${leagueKey}/players;status=${status};count=${count};start=${start}`;
    if (sort) endpoint += `;sort=${sort}`;
    if (sortType) endpoint += `;sort_type=${sortType}`;
    if (position) endpoint += `;position=${position}`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:league:${leagueKey}:players:${status}:${position || "all"}:${sort || "none"}:${sortType || "none"}:${count}:${start}`,
        cacheTtl: CACHE_TTL.PLAYERS,
      });

      return this.parsePlayersResponse(response);
    } catch (error) {
      console.error("Error fetching league players:", error);
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
      sortType?: "season" | "lastweek" | "lastmonth";
      count?: number;
      start?: number;
    } = {}
  ): Promise<SimplifiedPlayer[]> {
    const { position, status = "A", sort = "OR", sortType, count = 25, start = 0 } = options;

    let endpoint = `/league/${leagueKey}/players;status=${status};sort=${sort};count=${count};start=${start}`;
    if (sortType) {
      endpoint += `;sort_type=${sortType}`;
    }
    if (position) {
      endpoint += `;position=${position}`;
    }

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:league:${leagueKey}:players:${status}:${position || "all"}:${sort}:${sortType || "none"}:${count}:${start}`,
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
      const response = await this.request<unknown>(endpoint, {
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
      const response = await this.request<unknown>(endpoint, {
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
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:allmatchups:${teamKey}`,
        cacheTtl: CACHE_TTL.STANDINGS,
      });

      return this.parseMatchupsResponse(response, teamKey);
    } catch (error) {
      console.error("Error fetching all matchups:", error);
      throw error;
    }
  }

  /**
   * Get team matchups for specific weeks
   */
  async getTeamMatchups(teamKey: string, weeks?: number[]): Promise<SimplifiedMatchup[]> {
    const weeksParam = weeks?.length ? `;weeks=${weeks.join(",")}` : "";
    const endpoint = `/team/${teamKey}/matchups${weeksParam}`;
    const cacheSuffix = weeks?.length ? weeks.join(",") : "all";

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:matchups:${teamKey}:${cacheSuffix}`,
        cacheTtl: CACHE_TTL.STANDINGS,
      });

      return this.parseMatchupsResponse(response, teamKey);
    } catch (error) {
      console.error("Error fetching matchups:", error);
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
    type: "week" | "season" | "date" = "season",
    options?: { week?: number; date?: string }
  ): Promise<Record<string, number | string>> {
    const week = options?.week;
    const date = options?.date;
    const statType =
      type === "week" && week
        ? `stats;type=week;week=${week}`
        : type === "date" && date
        ? `stats;type=date;date=${date}`
        : "stats;type=season";
    const endpoint = `/player/${playerKey}/${statType}`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:playerstats:${playerKey}:${type}:${week || date || "season"}`,
        cacheTtl: type === "week" || type === "date" ? CACHE_TTL.MATCHUP : CACHE_TTL.STANDINGS,
      });

      return this.parsePlayerStatsResponse(response);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  }

  /**
   * Get team stats for a week or season
   */
  async getTeamStats(
    teamKey: string,
    type: "week" | "season" = "season",
    week?: number
  ): Promise<Record<string, number | string>> {
    const statType = type === "week" && week ? `stats;type=week;week=${week}` : "stats;type=season";
    const endpoint = `/team/${teamKey}/${statType}`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:teamstats:${teamKey}:${type}:${week || "season"}`,
        cacheTtl: type === "week" ? CACHE_TTL.MATCHUP : CACHE_TTL.STANDINGS,
      });

      return this.parseTeamStatsResponse(response);
    } catch (error) {
      console.error("Error fetching team stats:", error);
      throw error;
    }
  }

  // ===========================================================================
  // TRANSACTIONS & DRAFT
  // ===========================================================================

  /**
   * Get league transactions
   */
  async getTransactions(
    leagueKey: string,
    options: {
      types?: string; // comma-separated: add,drop,trade,waiver
      count?: number;
      start?: number;
    } = {}
  ): Promise<SimplifiedTransaction[]> {
    const { types, count = 25, start = 0 } = options;
    let endpoint = `/league/${leagueKey}/transactions;count=${count};start=${start}`;
    if (types) {
      endpoint += `;types=${types}`;
    }

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.leagueTransactions(leagueKey, start),
        cacheTtl: CACHE_TTL.TRANSACTIONS,
      });

      return this.parseTransactionsResponse(response);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  /**
   * Get draft results for a league
   */
  async getDraftResults(leagueKey: string): Promise<SimplifiedDraftPick[]> {
    const endpoint = `/league/${leagueKey}/draftresults`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.leagueDraftResults(leagueKey),
        cacheTtl: CACHE_TTL.DRAFT_RESULTS,
      });

      return this.parseDraftResultsResponse(response);
    } catch (error) {
      console.error("Error fetching draft results:", error);
      throw error;
    }
  }

  /**
   * Get league settings
   */
  async getLeagueSettings(leagueKey: string): Promise<YahooLeagueSettings | null> {
    const endpoint = `/league/${leagueKey}/settings`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.leagueSettings(leagueKey),
        cacheTtl: CACHE_TTL.SETTINGS,
      });

      return this.parseLeagueSettingsResponse(response);
    } catch (error) {
      console.error("Error fetching league settings:", error);
      throw error;
    }
  }

  // ===========================================================================
  // PLAYER & GAME INFO
  // ===========================================================================

  /**
   * Get player details
   */
  async getPlayer(playerKey: string): Promise<SimplifiedPlayer | null> {
    const endpoint = `/player/${playerKey}`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.player(playerKey),
        cacheTtl: CACHE_TTL.PLAYERS,
      });

      return this.parsePlayerResponse(response);
    } catch (error) {
      console.error("Error fetching player:", error);
      throw error;
    }
  }

  /**
   * Get player metadata
   */
  async getPlayerMetadata(playerKey: string): Promise<SimplifiedPlayer | null> {
    const endpoint = `/player/${playerKey}/metadata`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:player:metadata:${playerKey}`,
        cacheTtl: CACHE_TTL.PLAYERS,
      });

      return this.parsePlayerResponse(response);
    } catch (error) {
      console.error("Error fetching player metadata:", error);
      throw error;
    }
  }

  /**
   * Get game info (e.g., NBA game for current season)
   */
  async getGame(gameKey: string): Promise<SimplifiedGame | null> {
    const endpoint = `/game/${gameKey}`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: cacheKey.game(gameKey),
        cacheTtl: CACHE_TTL.GAME,
      });

      return this.parseGameResponse(response);
    } catch (error) {
      console.error("Error fetching game:", error);
      throw error;
    }
  }

  // ===========================================================================
  // USER TEAMS
  // ===========================================================================

  /**
   * Get all teams owned by the current user across all leagues
   */
  async getMyTeamsAcrossLeagues(): Promise<SimplifiedTeam[]> {
    const endpoint = `/users;use_login=1/games;game_keys=${NBA_GAME_KEY}/teams`;

    try {
      const response = await this.request<unknown>(endpoint, {
        cacheKeyOverride: `yahoo:user:teams`,
        cacheTtl: CACHE_TTL.ROSTER,
      });

      return this.parseUserTeamsResponse(response);
    } catch (error) {
      console.error("Error fetching user teams:", error);
      throw error;
    }
  }

  // ===========================================================================
  // WRITE OPERATIONS (PUT/POST)
  // ===========================================================================

  /**
   * Base method for PUT/POST requests
   */
  private async writeRequest<T>(
    endpoint: string,
    method: "PUT" | "POST",
    xmlBody: string
  ): Promise<T> {
    const url = `${YAHOO_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/xml",
      },
      body: xmlBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Yahoo API Write Error:", response.status, errorText);
      throw new YahooApiError(
        `Yahoo API write request failed: ${response.status}`,
        response.status,
        errorText
      );
    }

    // Try to parse as JSON, fall back to text
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }
    return response.text() as unknown as T;
  }

  /**
   * Update roster positions for a team
   */
  async updateRoster(
    teamKey: string,
    options: {
      date?: string;
      week?: number;
      players: { playerKey: string; position: string }[];
    }
  ): Promise<{ success: boolean; message?: string }> {
    const { date, week, players } = options;

    // Build coverage element based on NBA (date) or other sports (week)
    let coverageXml = "";
    if (date) {
      coverageXml = `<coverage_type>date</coverage_type><date>${date}</date>`;
    } else if (week) {
      coverageXml = `<coverage_type>week</coverage_type><week>${week}</week>`;
    }

    const playersXml = players
      .map(
        (p) => `<player>
        <player_key>${p.playerKey}</player_key>
        <position>${p.position}</position>
      </player>`
      )
      .join("");

    const xmlBody = `<?xml version="1.0"?>
<fantasy_content>
  <roster>
    ${coverageXml}
    <players>
      ${playersXml}
    </players>
  </roster>
</fantasy_content>`;

    const result = await this.writeRequest<string>(
      `/team/${teamKey}/roster`,
      "PUT",
      xmlBody
    );

    // Invalidate roster cache after update
    await cache.invalidateForTeam(teamKey);

    return { success: true, message: result };
  }

  /**
   * Add a free agent to your team
   */
  async addPlayer(
    leagueKey: string,
    playerKey: string,
    teamKey: string
  ): Promise<{ success: boolean; message?: string }> {
    const xmlBody = `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>add</type>
    <player>
      <player_key>${playerKey}</player_key>
      <transaction_data>
        <type>add</type>
        <destination_team_key>${teamKey}</destination_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>`;

    const result = await this.writeRequest<string>(
      `/league/${leagueKey}/transactions`,
      "POST",
      xmlBody
    );

    // Invalidate caches after transaction
    await cache.invalidateForTeam(teamKey);
    await cache.invalidateForLeague(leagueKey);

    return { success: true, message: result };
  }

  /**
   * Add and drop players in a single transaction
   */
  async addDropPlayers(
    leagueKey: string,
    addPlayerKey: string,
    dropPlayerKey: string,
    teamKey: string
  ): Promise<{ success: boolean; message?: string }> {
    const xmlBody = `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <players>
      <player>
        <player_key>${addPlayerKey}</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>${teamKey}</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>${dropPlayerKey}</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>${teamKey}</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>`;

    const result = await this.writeRequest<string>(
      `/league/${leagueKey}/transactions`,
      "POST",
      xmlBody
    );

    // Invalidate caches after transaction
    await cache.invalidateForTeam(teamKey);
    await cache.invalidateForLeague(leagueKey);

    return { success: true, message: result };
  }

  /**
   * Drop a player from your team
   */
  async dropPlayer(
    leagueKey: string,
    playerKey: string,
    teamKey: string
  ): Promise<{ success: boolean; message?: string }> {
    const xmlBody = `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>drop</type>
    <player>
      <player_key>${playerKey}</player_key>
      <transaction_data>
        <type>drop</type>
        <source_team_key>${teamKey}</source_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>`;

    const result = await this.writeRequest<string>(
      `/league/${leagueKey}/transactions`,
      "POST",
      xmlBody
    );

    // Invalidate caches after transaction
    await cache.invalidateForTeam(teamKey);
    await cache.invalidateForLeague(leagueKey);

    return { success: true, message: result };
  }

  /**
   * Add a player and drop another in a single transaction
   */
  async addDropPlayer(
    leagueKey: string,
    addPlayerKey: string,
    dropPlayerKey: string,
    teamKey: string
  ): Promise<{ success: boolean; message?: string }> {
    const xmlBody = `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <players>
      <player>
        <player_key>${addPlayerKey}</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>${teamKey}</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>${dropPlayerKey}</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>${teamKey}</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>`;

    const result = await this.writeRequest<string>(
      `/league/${leagueKey}/transactions`,
      "POST",
      xmlBody
    );

    // Invalidate caches after transaction
    await cache.invalidateForTeam(teamKey);
    await cache.invalidateForLeague(leagueKey);

    return { success: true, message: result };
  }

  // ===========================================================================
  // RESPONSE PARSERS (Yahoo's response format is deeply nested)
  // ===========================================================================

  private parseLeaguesResponse(response: unknown): SimplifiedLeague[] {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const users = (fantasyContent?.users as unknown[])?.[0] as
        | Record<string, unknown>
        | undefined;
      const user = users?.user as unknown[] | undefined;
      const games =
        ((user?.[1] as Record<string, unknown>)?.games as Record<string, unknown>) ||
        {};

      const leagues: SimplifiedLeague[] = [];

      for (const game of Object.values(games)) {
        if (typeof game !== "object" || !game) continue;
        const gameData = ((game as Record<string, unknown>)?.game as unknown[]) || [];
        const gameInfo = gameData[0] as Record<string, unknown> | undefined;
        const leaguesData =
          ((gameData[1] as Record<string, unknown>)?.leagues as Record<string, unknown>) ||
          {};

        for (const league of Object.values(leaguesData)) {
          if (typeof league !== "object" || !league) continue;
          const leagueInfo = ((league as Record<string, unknown>)?.league as unknown[])?.[0] as
            | Record<string, unknown>
            | undefined;
          if (!leagueInfo) continue;

          leagues.push({
            key: leagueInfo.league_key as string,
            id: leagueInfo.league_id as string,
            name: leagueInfo.name as string,
            logoUrl: leagueInfo.logo_url as string | undefined,
            season: leagueInfo.season as string,
            currentWeek: leagueInfo.current_week as number,
            numTeams: leagueInfo.num_teams as number,
            scoringType: leagueInfo.scoring_type as string,
            isActive: !Boolean(gameInfo?.is_game_over),
          });
        }
      }

      return leagues;
    } catch (error) {
      console.error("Error parsing leagues response:", error);
      return [];
    }
  }

  private parseUserTeamsResponse(response: unknown): SimplifiedTeam[] {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const users = (fantasyContent?.users as unknown[])?.[0] as
        | Record<string, unknown>
        | undefined;
      const user = users?.user as unknown[] | undefined;
      const games =
        ((user?.[1] as Record<string, unknown>)?.games as Record<string, unknown>) ||
        {};

      const teams: SimplifiedTeam[] = [];

      for (const game of Object.values(games)) {
        if (typeof game !== "object" || !game) continue;
        const gameData = ((game as Record<string, unknown>)?.game as unknown[]) || [];
        const teamsData =
          ((gameData[1] as Record<string, unknown>)?.teams as Record<string, unknown>) ||
          {};

        for (const team of Object.values(teamsData)) {
          if (typeof team !== "object" || !team) continue;
          const teamInfoRaw =
            ((team as Record<string, unknown>)?.team as unknown[])?.[0];
          const teamInfo = Array.isArray(teamInfoRaw) ? teamInfoRaw : [];

          // Yahoo returns team info as array of objects with different keys
          const teamData: Record<string, unknown> = {};
          for (const item of teamInfo) {
            if (typeof item === "object" && item !== null) {
              Object.assign(teamData, item as Record<string, unknown>);
            }
          }

          if (teamData.team_key) {
            teams.push({
              key: teamData.team_key as string,
              id: teamData.team_id as string,
              name: teamData.name as string,
              logoUrl: (teamData.team_logos as { team_logo?: { url?: string } }[])?.[0]
                ?.team_logo?.url,
              isOwned: true, // All teams from this endpoint are owned by the user
            });
          }
        }
      }

      return teams;
    } catch (error) {
      console.error("Error parsing user teams response:", error);
      return [];
    }
  }

  private parseLeagueResponse(response: unknown): YahooLeague | null {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const league = fantasyContent?.league;
      if (!Array.isArray(league) || !league[0]) return null;

      const leagueMeta = league[0] as YahooLeague;
      const leagueExtras = (league[1] as Record<string, unknown>) || {};

      return {
        ...leagueMeta,
        settings: (leagueExtras.settings as unknown[] | undefined)?.[0] as
          | YahooLeagueSettings
          | undefined,
        standings: leagueExtras.standings as YahooStandings | undefined,
        scoreboard: leagueExtras.scoreboard as YahooScoreboard | undefined,
      };
    } catch (error) {
      console.error("Error parsing league response:", error);
      return null;
    }
  }

  private flattenYahooArray(data: unknown): Record<string, unknown> {
    if (!data) return {};
    if (Array.isArray(data)) {
      const merged: Record<string, unknown> = {};
      for (const item of data) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          Object.assign(merged, item as Record<string, unknown>);
        }
      }
      return merged;
    }
    if (typeof data === "object") {
      return data as Record<string, unknown>;
    }
    return {};
  }

  private parseStandingsResponse(response: unknown): YahooStandings | null {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const league = fantasyContent?.league as unknown[] | undefined;
      if (!league) return null;

      const standingsRaw = (league[1] as Record<string, unknown>)?.standings as
        | Record<string, unknown>
        | undefined;
      if (!standingsRaw) return null;

      const standingsNode =
        ((standingsRaw as Record<string, unknown>)?.teams
          ? standingsRaw
          : (standingsRaw as Record<string, unknown>)?.["0"]) || {};
      const teamsObj = (standingsNode as Record<string, unknown>).teams as
        | Record<string, unknown>
        | undefined;
      if (!teamsObj) return null;
      const teams: YahooStandings["teams"] = [];

      for (const key of Object.keys(teamsObj)) {
        if (key === "count") continue;
        const teamEntry = teamsObj[key] as Record<string, unknown>;
        const teamData = teamEntry?.team as unknown[] | undefined;
        if (!teamData) continue;

        const teamInfo = this.flattenYahooArray(teamData[0]);
        const teamExtras = (teamData[1] as Record<string, unknown>) || {};
        const teamStandings =
          (teamExtras.team_standings as YahooTeamStanding["team_standings"]) ||
          (teamInfo.team_standings as YahooTeamStanding["team_standings"]);

        if (!teamInfo.team_key) continue;

        teams.push({
          team: {
            team_key: teamInfo.team_key as string,
            team_id: (teamInfo.team_id as string) || "",
            name: (teamInfo.name as string) || "",
            is_owned_by_current_login: teamInfo.is_owned_by_current_login === 1,
            url: (teamInfo.url as string) || "",
            team_logos: teamInfo.team_logos as YahooTeam["team_logos"],
          },
          team_standings: teamStandings || {
            rank: 999,
            outcome_totals: { wins: 0, losses: 0, ties: 0, percentage: "0" },
          },
        });
      }

      return { teams };
    } catch (error) {
      console.error("Error parsing standings response:", error);
      return null;
    }
  }

  private parseScoreboardResponse(response: unknown): YahooScoreboard | null {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const league = fantasyContent?.league as unknown[] | undefined;
      if (!league) return null;

      const scoreboardRaw = (league[1] as Record<string, unknown>)?.scoreboard as
        | Record<string, unknown>
        | undefined;
      if (!scoreboardRaw) return null;

      const scoreboardData = this.flattenYahooArray(scoreboardRaw);
      const scoreboardArray = Array.isArray(scoreboardRaw) ? scoreboardRaw : [];
      const scoreboardNode =
        (scoreboardData.matchups ? scoreboardData : (scoreboardData["0"] as Record<string, unknown>) || {}) ||
        (scoreboardArray[0] as Record<string, unknown>) ||
        {};

      // Parse the scoreboard week
      const week =
        (scoreboardData.week as number | undefined) ??
        ((scoreboardNode as Record<string, unknown>).week as number | undefined) ??
        ((scoreboardArray[0] as Record<string, unknown>)?.week as number | undefined) ??
        0;

      // Yahoo returns matchups in a nested object format: { 0: { matchup: {...} }, count: N }
      const matchupsObj =
        ((scoreboardNode as Record<string, unknown>).matchups as Record<string, unknown>) ||
        (scoreboardData.matchups as Record<string, unknown>) ||
        ((scoreboardArray[0] as Record<string, unknown>)?.matchups as Record<string, unknown>) ||
        {};
      const matchups: YahooScoreboard["matchups"] = [];

      for (const key of Object.keys(matchupsObj)) {
        if (key === "count") continue;
        const matchupData = (matchupsObj[key] as Record<string, unknown>)?.matchup as
          | unknown[]
          | Record<string, unknown>
          | undefined;
        if (!matchupData) continue;
        const matchupArray = Array.isArray(matchupData) ? matchupData : [matchupData];
        const matchupMeta = this.flattenYahooArray(matchupArray[0]);
        const matchupExtras = (matchupArray[1] as Record<string, unknown>) || {};

        // Parse teams within matchup - they're in a nested object format too
        const teamsObj =
          (matchupExtras.teams as Record<string, unknown>) ||
          (matchupMeta.teams as Record<string, unknown>) ||
          ((matchupMeta["0"] as Record<string, unknown>)?.teams as Record<string, unknown>) ||
          {};
        const teams: YahooScoreboard["matchups"][number]["teams"] = [];

        for (const teamKey of Object.keys(teamsObj)) {
          if (teamKey === "count") continue;
          const teamData = (teamsObj[teamKey] as Record<string, unknown>)?.team as
            | unknown[]
            | undefined;
          if (!teamData) continue;

          // Parse team info from array format
          const teamInfo = this.flattenYahooArray(teamData[0] ?? teamData);

          // Get team points from the second element if present
          const teamStats = teamData[1] as Record<string, unknown> | undefined;
          const teamPoints =
            (teamStats?.team_points as YahooTeam["team_points"]) ?? undefined;
          const teamProjectedPoints =
            (teamStats?.team_projected_points as YahooTeam["team_points"]) ?? undefined;
          const winProbability = teamStats?.win_probability as number | undefined;

          teams.push({
            team: {
              team_key: teamInfo.team_key as string,
              team_id: teamInfo.team_id as string,
              name: teamInfo.name as string,
              url: (teamInfo.url as string) || "",
              team_logos: teamInfo.team_logos as YahooTeam["team_logos"],
              is_owned_by_current_login: teamInfo.is_owned_by_current_login === 1,
            },
            team_points: teamPoints,
            team_projected_points: teamProjectedPoints,
            win_probability: winProbability,
          });
        }

        matchups.push({
          week: (matchupMeta?.week as number) || week,
          week_start: (matchupMeta?.week_start as string) || "",
          week_end: (matchupMeta?.week_end as string) || "",
          status: (matchupMeta?.status as string) || "unknown",
          is_playoffs: matchupMeta?.is_playoffs === 1,
          is_consolation: matchupMeta?.is_consolation === 1,
          is_tied: matchupMeta?.is_tied as boolean | undefined,
          winner_team_key: matchupMeta?.winner_team_key as string | undefined,
          teams,
        });
      }

      return {
        week,
        matchups,
      };
    } catch (error) {
      console.error("Error parsing scoreboard response:", error);
      return null;
    }
  }

  private parseTeamsResponse(response: unknown): SimplifiedTeam[] {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const league = fantasyContent?.league as unknown[] | undefined;
      const teams =
        ((league?.[1] as Record<string, unknown>)?.teams as Record<string, unknown>) || {};

      const result: SimplifiedTeam[] = [];

      for (const team of Object.values(teams)) {
        if (typeof team !== "object" || !team) continue;
        const teamInfoRaw =
          ((team as Record<string, unknown>)?.team as unknown[])?.[0];
        const teamData = this.flattenYahooArray(teamInfoRaw);

        if (teamData.team_key) {
          result.push({
            key: teamData.team_key as string,
            id: teamData.team_id as string,
            name: teamData.name as string,
            logoUrl: (teamData.team_logos as { team_logo?: { url?: string } }[])?.[0]
              ?.team_logo?.url,
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

  private parseTeamResponse(response: unknown): YahooTeam | null {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const team = fantasyContent?.team as unknown[] | undefined;
      if (!team) return null;

      const teamInfoRaw = team[0] as unknown;
      const teamInfo = Array.isArray(teamInfoRaw) ? teamInfoRaw : [];
      const teamData: Record<string, unknown> = {};
      for (const item of teamInfo) {
        if (typeof item === "object" && item !== null) {
          Object.assign(teamData, item as Record<string, unknown>);
        }
      }

      const baseTeam: YahooTeam = {
        team_key: (teamData.team_key as string) || "",
        team_id: (teamData.team_id as string) || "",
        name: (teamData.name as string) || "",
        is_owned_by_current_login: teamData.is_owned_by_current_login === 1,
        url: (teamData.url as string) || "",
      };
      const teamDataPartial = teamData as Partial<YahooTeam>;

      return {
        ...baseTeam,
        ...teamDataPartial,
        roster: (team[1] as Record<string, unknown>)?.roster as YahooTeam["roster"],
      };
    } catch (error) {
      console.error("Error parsing team response:", error);
      return null;
    }
  }

  private parsePlayersResponse(response: unknown): SimplifiedPlayer[] {
    try {
      const players: SimplifiedPlayer[] = [];

      // Navigate to players array - structure varies by endpoint
      let playersData: Record<string, unknown> | undefined;

      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;

      if (fantasyContent?.team) {
        // /team/{key}/roster/players
        const team = fantasyContent.team as unknown[];
        const roster = (team[1] as Record<string, unknown>)?.roster as
          | unknown[]
          | Record<string, unknown>
          | undefined;
        const rosterArray = Array.isArray(roster) ? roster : [roster];
        const rosterNode = (rosterArray[0] as Record<string, unknown>) || {};
        playersData =
          ((rosterArray?.[1] as Record<string, unknown>)?.players as Record<string, unknown>) ||
          ((rosterArray?.[0] as Record<string, unknown>)?.players as Record<string, unknown>) ||
          ((rosterNode["0"] as Record<string, unknown>)?.players as Record<string, unknown>) ||
          ((team[1] as Record<string, unknown>)?.players as Record<string, unknown>) ||
          undefined;
      } else if (fantasyContent?.league) {
        // /league/{key}/players
        const league = fantasyContent.league as unknown[];
        playersData = (league[1] as Record<string, unknown>)?.players as
          | Record<string, unknown>
          | undefined;
      }

      if (!playersData) return [];

      for (const player of Object.values(playersData)) {
        if (typeof player !== "object" || !player) continue;

        const playerInfo = (player as Record<string, unknown>)?.player as
          | unknown[]
          | undefined;
        if (!playerInfo) continue;

        const playerData: Record<string, unknown> = {};
        const playerArrayRaw = playerInfo[0] as unknown;
        const playerArray = Array.isArray(playerArrayRaw) ? playerArrayRaw : [playerArrayRaw];

        for (const item of playerArray) {
          if (typeof item === "object" && item !== null) {
            const itemObj = item as Record<string, unknown>;
            if (itemObj.name) playerData.name = itemObj.name;
            else if (itemObj.headshot) playerData.headshot = itemObj.headshot;
            else if (itemObj.eligible_positions)
              playerData.eligible_positions = itemObj.eligible_positions;
            else if (itemObj.selected_position)
              playerData.selected_position = itemObj.selected_position;
            else if (itemObj.percent_owned) playerData.percent_owned = itemObj.percent_owned;
            else Object.assign(playerData, itemObj);
          }
        }

        // Check playerInfo[1] for selected_position (Yahoo API returns it as a separate array element)
        const playerExtras = playerInfo[1] as Record<string, unknown> | undefined;
        if (playerExtras?.selected_position && !playerData.selected_position) {
          playerData.selected_position = playerExtras.selected_position;
        }

        if (playerData.player_key) {
          const name = playerData.name as Record<string, string> | undefined;
          const selectedPosition = playerData.selected_position as
            | unknown[]
            | Record<string, unknown>
            | undefined;
          const eligiblePositions = playerData.eligible_positions as
            | Array<{ position: string }>
            | undefined;
          const selectedPositionObj = Array.isArray(selectedPosition)
            ? ((selectedPosition?.[1] as Record<string, unknown>) ||
                (selectedPosition?.[0] as Record<string, unknown>) ||
                {})
            : selectedPosition || {};

          players.push({
            key: playerData.player_key as string,
            id: playerData.player_id as string,
            name: name?.full || `${name?.first || ""} ${name?.last || ""}`.trim(),
            team: (playerData.editorial_team_full_name as string) || "",
            teamAbbr: (playerData.editorial_team_abbr as string) || "",
            position:
              (playerData.display_position as string) ||
              (playerData.primary_position as string) ||
              "",
            eligiblePositions:
              eligiblePositions?.map((p) => p.position) || [],
            imageUrl:
              (playerData.headshot as { url?: string } | undefined)?.url ||
              (playerData.image_url as string | undefined),
            status: playerData.status as string | undefined,
            statusFull: playerData.status_full as string | undefined,
            injuryNote: playerData.injury_note as string | undefined,
            selectedPosition: (selectedPositionObj as Record<string, unknown>)?.position as
              | string
              | undefined,
            percentOwned: (playerData.percent_owned as { value?: number } | undefined)?.value,
          });
        }
      }

      return players;
    } catch (error) {
      console.error("Error parsing players response:", error);
      return [];
    }
  }

  private parseMatchupsResponse(response: unknown, myTeamKey: string): SimplifiedMatchup[] {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const team = fantasyContent?.team as unknown[] | undefined;
      if (!team) return [];

      const matchupsData = (team[1] as Record<string, unknown>)?.matchups as
        | Record<string, unknown>
        | undefined;
      if (!matchupsData) return [];

      const matchups: SimplifiedMatchup[] = [];

      for (const matchup of Object.values(matchupsData)) {
        if (typeof matchup !== "object" || !matchup) continue;

        const matchupInfo = (matchup as Record<string, unknown>)?.matchup as
          | unknown[]
          | Record<string, unknown>
          | undefined;
        if (!matchupInfo) continue;

        const matchupArray = Array.isArray(matchupInfo) ? matchupInfo : [matchupInfo];
        const matchupMeta = this.flattenYahooArray(matchupArray[0]);
        const matchupExtras = (matchupArray[1] as Record<string, unknown>) || {};
        const teamsInMatchup =
          (matchupExtras.teams as Record<string, unknown>) ||
          (matchupMeta.teams as Record<string, unknown>) ||
          ((matchupMeta["0"] as Record<string, unknown>)?.teams as Record<string, unknown>) ||
          {};
        let myTeam: Record<string, unknown> | null = null;
        let opponent: Record<string, unknown> | null = null;

        for (const t of Object.values(teamsInMatchup)) {
          if (typeof t !== "object" || !t) continue;
          const teamDataRaw =
            ((t as Record<string, unknown>)?.team as unknown[])?.[0];
          const teamData = Array.isArray(teamDataRaw) ? teamDataRaw : [teamDataRaw];

          let teamKey = "";
          for (const item of teamData) {
            if (typeof item === "object" && item !== null) {
              const itemObj = item as Record<string, unknown>;
              if (itemObj.team_key) {
                teamKey = itemObj.team_key as string;
                break;
              }
            }
          }

          if (teamKey === myTeamKey) {
            myTeam = t as Record<string, unknown>;
          } else {
            opponent = t as Record<string, unknown>;
          }
        }

        if (myTeam && opponent) {
          const status = matchupMeta?.status as string | undefined;
          matchups.push({
            week: (matchupMeta?.week as number) || 0,
            status:
              status === "postevent"
                ? "completed"
                : status === "midevent"
                ? "in_progress"
                : "upcoming",
            isPlayoffs: matchupMeta?.is_playoffs === 1,
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

  private extractTeamFromMatchup(teamData: Record<string, unknown>): SimplifiedMatchup["myTeam"] {
    const team = (teamData?.team as unknown[]) || [];
    const teamInfo = this.flattenYahooArray(team[0]);
    const teamStats = team[1] as Record<string, unknown> | undefined;

    const name = (teamInfo.name as string) || "";
    const key = teamInfo.team_key as string | undefined;

    const teamPoints = teamStats?.team_points as { total?: string } | undefined;
    const teamProjected = teamStats?.team_projected_points as { total?: string } | undefined;

    return {
      key,
      name,
      points: teamPoints?.total ? parseFloat(teamPoints.total) : undefined,
      projectedPoints: teamProjected?.total
        ? parseFloat(teamProjected.total)
        : undefined,
    };
  }

  private parsePlayerStatsResponse(response: unknown): Record<string, number | string> {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const player = fantasyContent?.player as unknown[] | undefined;
      if (!player) return {};

      const stats =
        ((player[1] as Record<string, unknown>)?.player_stats as Record<string, unknown>)
          ?.stats || [];
      const result: Record<string, number | string> = {};

      for (const stat of stats as unknown[]) {
        if (typeof stat !== "object" || !stat) continue;
        const statObj = stat as Record<string, unknown>;
        const statEntry = statObj.stat as Record<string, unknown> | undefined;
        if (!statEntry) continue;
        const statId = statEntry.stat_id as number | undefined;
        const value = statEntry.value as string | undefined;
        if (statId !== undefined && value !== undefined) {
          const key = `stat_${statId}`;
          if (typeof value === "string" && value.includes("/")) {
            result[key] = value;
          } else {
            const numeric = parseFloat(value);
            result[key] = Number.isNaN(numeric) ? value : numeric;
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Error parsing player stats response:", error);
      return {};
    }
  }

  private parseTeamStatsResponse(response: unknown): Record<string, number | string> {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as
        | Record<string, unknown>
        | undefined;
      const team = fantasyContent?.team as unknown[] | undefined;
      if (!team) return {};

      const stats =
        ((team[1] as Record<string, unknown>)?.team_stats as Record<string, unknown>)?.stats ||
        [];
      const result: Record<string, number | string> = {};

      for (const stat of stats as unknown[]) {
        if (typeof stat !== "object" || !stat) continue;
        const statObj = stat as Record<string, unknown>;
        const statEntry = statObj.stat as Record<string, unknown> | undefined;
        if (!statEntry) continue;
        const statId = statEntry.stat_id as number | undefined;
        const value = statEntry.value as string | undefined;
        if (statId !== undefined && value !== undefined) {
          const key = `stat_${statId}`;
          if (typeof value === "string" && value.includes("/")) {
            result[key] = value;
          } else {
            const numeric = parseFloat(value);
            result[key] = Number.isNaN(numeric) ? value : numeric;
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Error parsing team stats response:", error);
      return {};
    }
  }

  private parseTransactionsResponse(response: unknown): SimplifiedTransaction[] {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as Record<string, unknown>;
      const league = fantasyContent?.league as unknown[];
      if (!league) return [];

      const transactions = (league[1] as Record<string, unknown>)?.transactions || {};
      const result: SimplifiedTransaction[] = [];

      for (const transaction of Object.values(transactions)) {
        if (typeof transaction !== "object" || !transaction) continue;
        const txnInfo = (transaction as Record<string, unknown>)?.transaction as unknown[];
        if (!txnInfo) continue;

        const txnMeta = txnInfo[0] as Record<string, unknown>;
        const txnPlayers = (txnInfo[1] as Record<string, unknown>)?.players || {};

        const players: SimplifiedTransaction["players"] = [];
        for (const player of Object.values(txnPlayers)) {
          if (typeof player !== "object" || !player) continue;
          const playerInfo = (player as Record<string, unknown>)?.player as unknown[];
          if (!playerInfo) continue;

          const playerData: Record<string, unknown> = {};
          for (const item of (playerInfo[0] as unknown[]) || []) {
            if (typeof item === "object" && item !== null) {
              const itemObj = item as Record<string, unknown>;
              if (itemObj.name) playerData.name = itemObj.name;
              else Object.assign(playerData, item);
            }
          }

          const transactionData = (playerInfo[1] as Record<string, unknown>)?.transaction_data as Record<string, unknown>;
          const nameObj = playerData.name as Record<string, string> | undefined;

          players.push({
            key: playerData.player_key as string,
            name: nameObj?.full || `${nameObj?.first || ""} ${nameObj?.last || ""}`.trim(),
            type: transactionData?.type as "add" | "drop",
            sourceTeamKey: transactionData?.source_team_key as string | undefined,
            sourceTeamName: transactionData?.source_team_name as string | undefined,
            destTeamKey: transactionData?.destination_team_key as string | undefined,
            destTeamName: transactionData?.destination_team_name as string | undefined,
          });
        }

        result.push({
          key: txnMeta.transaction_key as string,
          type: txnMeta.type as SimplifiedTransaction["type"],
          status: txnMeta.status as SimplifiedTransaction["status"],
          timestamp: txnMeta.timestamp as number,
          players,
        });
      }

      return result;
    } catch (error) {
      console.error("Error parsing transactions response:", error);
      return [];
    }
  }

  private parseDraftResultsResponse(response: unknown): SimplifiedDraftPick[] {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as Record<string, unknown>;
      const league = fantasyContent?.league as unknown[];
      if (!league) return [];

      const draftResults = (league[1] as Record<string, unknown>)?.draft_results || {};
      const result: SimplifiedDraftPick[] = [];

      for (const pick of Object.values(draftResults)) {
        if (typeof pick !== "object" || !pick) continue;
        const pickInfo = (pick as Record<string, unknown>)?.draft_result as Record<string, unknown>;
        if (!pickInfo) continue;

        result.push({
          pick: pickInfo.pick as number,
          round: pickInfo.round as number,
          teamKey: pickInfo.team_key as string,
          playerKey: pickInfo.player_key as string,
        });
      }

      return result;
    } catch (error) {
      console.error("Error parsing draft results response:", error);
      return [];
    }
  }

  private parseLeagueSettingsResponse(response: unknown): YahooLeagueSettings | null {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as Record<string, unknown>;
      const league = fantasyContent?.league as unknown[];
      if (!league) return null;

      const settings = (league[1] as Record<string, unknown>)?.settings as unknown[];
      return (settings?.[0] as YahooLeagueSettings) || null;
    } catch (error) {
      console.error("Error parsing league settings response:", error);
      return null;
    }
  }

  private parsePlayerResponse(response: unknown): SimplifiedPlayer | null {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as Record<string, unknown>;
      const player = fantasyContent?.player as unknown[];
      if (!player) return null;

      const playerData: Record<string, unknown> = {};
      const playerArray = (player[0] as unknown[]) || [];

      for (const item of playerArray) {
        if (typeof item === "object" && item !== null) {
          const itemObj = item as Record<string, unknown>;
          if (itemObj.name) playerData.name = itemObj.name;
          else if (itemObj.headshot) playerData.headshot = itemObj.headshot;
          else if (itemObj.eligible_positions)
            playerData.eligible_positions = itemObj.eligible_positions;
          else if (itemObj.percent_owned)
            playerData.percent_owned = itemObj.percent_owned;
          else Object.assign(playerData, item);
        }
      }

      if (!playerData.player_key) return null;

      const nameObj = playerData.name as Record<string, string> | undefined;
      const headshotObj = playerData.headshot as Record<string, string> | undefined;
      const percentOwnedObj = playerData.percent_owned as Record<string, number> | undefined;
      const eligiblePositions = playerData.eligible_positions as { position: string }[] | undefined;

      return {
        key: playerData.player_key as string,
        id: playerData.player_id as string,
        name: nameObj?.full || `${nameObj?.first || ""} ${nameObj?.last || ""}`.trim(),
        team: (playerData.editorial_team_full_name as string) || "",
        teamAbbr: (playerData.editorial_team_abbr as string) || "",
        position:
          (playerData.display_position as string) ||
          (playerData.primary_position as string) ||
          "",
        eligiblePositions: eligiblePositions?.map((p) => p.position) || [],
        imageUrl: headshotObj?.url || (playerData.image_url as string),
        status: playerData.status as string | undefined,
        statusFull: playerData.status_full as string | undefined,
        injuryNote: playerData.injury_note as string | undefined,
        percentOwned: percentOwnedObj?.value,
      };
    } catch (error) {
      console.error("Error parsing player response:", error);
      return null;
    }
  }

  private parseGameResponse(response: unknown): SimplifiedGame | null {
    try {
      const fantasyContent = (response as Record<string, unknown>)?.fantasy_content as Record<string, unknown>;
      const game = fantasyContent?.game as unknown[];
      if (!game) return null;

      const gameInfo = (game[0] as Record<string, unknown>) || {};
      return {
        key: gameInfo.game_key as string,
        id: gameInfo.game_id as string,
        name: gameInfo.name as string,
        code: gameInfo.code as string,
        type: gameInfo.type as string,
        url: gameInfo.url as string,
        season: gameInfo.season as string,
        isRegistrationOver: gameInfo.is_registration_over === 1,
        isGameOver: gameInfo.is_game_over === 1,
        isOffseason: gameInfo.is_offseason === 1,
      };
    } catch (error) {
      console.error("Error parsing game response:", error);
      return null;
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
