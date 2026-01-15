import { Redis } from "@upstash/redis";

// Initialize Redis from environment variables.
// Upstash expects: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
export const redis = Redis.fromEnv();

// Cache helper functions with TTL (Time To Live)
export const cache = {
  /**
   * Get cached data or fetch fresh data if not cached
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300 // 5 minutes default
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        console.log(`[Cache HIT] ${key}`);
        return cached;
      }

      // Fetch fresh data
      console.log(`[Cache MISS] ${key}`);
      const freshData = await fetcher();

      // Store in cache with TTL
      await redis.setex(key, ttlSeconds, freshData);

      return freshData;
    } catch (error) {
      console.error(`[Cache ERROR] ${key}:`, error);
      // On cache error, try to fetch fresh data
      return fetcher();
    }
  },

  /**
   * Set cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, value);
    } catch (error) {
      console.error(`[Cache SET ERROR] ${key}:`, error);
      // Silently fail - caching is not critical
    }
  },

  /**
   * Get from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await redis.get<T>(key);
    } catch (error) {
      console.error(`[Cache GET ERROR] ${key}:`, error);
      return null;
    }
  },

  /**
   * Delete from cache
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`[Cache DEL ERROR] ${key}:`, error);
    }
  },

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch (error) {
      console.error(`[Cache DEL MANY ERROR]:`, error);
    }
  },

  /**
   * Clear all cache with pattern (careful!)
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`[Cache CLEAR ERROR] ${pattern}:`, error);
    }
  },

  /**
   * Invalidate cache after write operations
   */
  async invalidateForTeam(teamKey: string): Promise<void> {
    const patterns = [
      `yahoo:roster:${teamKey}*`,
      `yahoo:team:*:${teamKey.split(".t.")[0]}*`,
      `yahoo:matchup:${teamKey}*`,
    ];
    for (const pattern of patterns) {
      await cache.clearPattern(pattern);
    }
  },

  /**
   * Invalidate cache after league transactions
   */
  async invalidateForLeague(leagueKey: string): Promise<void> {
    const patterns = [
      `yahoo:transactions:${leagueKey}*`,
      `league:${leagueKey}:freeagents*`,
      `yahoo:standings:${leagueKey}`,
      `yahoo:teams:${leagueKey}`,
    ];
    for (const pattern of patterns) {
      await cache.clearPattern(pattern);
    }
  },
};

// Cache TTL presets (in seconds)
export const CACHE_TTL = {
  // Long-lived (rarely changes)
  LEAGUE_SETTINGS: 60 * 60 * 24, // 24 hours
  SETTINGS: 60 * 60 * 24, // Alias for LEAGUE_SETTINGS
  GAME: 60 * 60 * 24, // 24 hours - game info rarely changes
  DRAFT_RESULTS: 60 * 60 * 24, // 24 hours - draft results never change

  // Medium-lived
  STANDINGS: 60 * 60, // 1 hour
  PLAYER_STATS: 60 * 30, // 30 minutes
  PLAYERS: 60 * 30, // 30 minutes - alias for player data
  USER_TEAMS: 60 * 30, // 30 minutes

  // Short-lived (changes frequently)
  ROSTER: 60 * 15, // 15 minutes
  FREE_AGENTS: 60 * 10, // 10 minutes
  TRANSACTIONS: 60 * 10, // 10 minutes

  // Very short-lived (live data)
  SCOREBOARD: 60 * 5, // 5 minutes
  MATCHUP: 60 * 5, // 5 minutes

  // External data
  NBA_SCHEDULE: 60 * 60 * 6, // 6 hours
};

// Cache key generators
export const cacheKey = {
  // User
  userLeagues: (userId: string) => `user:${userId}:leagues`,
  userTeams: () => `yahoo:user:teams`,
  leagues: (userId: string) => `yahoo:leagues:${userId}`,

  // League
  league: (leagueKey: string) => `yahoo:league:${leagueKey}`,
  leagueSettings: (leagueKey: string) => `yahoo:league:${leagueKey}:settings`,
  leagueStandings: (leagueKey: string) => `yahoo:standings:${leagueKey}`,
  leagueTeams: (leagueKey: string) => `yahoo:teams:${leagueKey}`,
  leaguePlayers: (leagueKey: string, status: string, position?: string) =>
    position
      ? `yahoo:league:${leagueKey}:players:${status}:${position}`
      : `yahoo:league:${leagueKey}:players:${status}`,
  leagueTransactions: (leagueKey: string, start: number) =>
    `yahoo:transactions:${leagueKey}:${start}`,
  leagueDraftResults: (leagueKey: string) =>
    `yahoo:draftresults:${leagueKey}`,

  // Team
  team: (userId: string, leagueKey: string) =>
    `yahoo:team:${userId}:${leagueKey}`,
  teamRoster: (teamKey: string) => `team:${teamKey}:roster`,
  roster: (teamKey: string, week?: number) =>
    week ? `yahoo:roster:${teamKey}:${week}` : `yahoo:roster:${teamKey}`,
  teamStats: (teamKey: string, type: string, week?: number) =>
    week
      ? `yahoo:teamstats:${teamKey}:${type}:${week}`
      : `yahoo:teamstats:${teamKey}:${type}`,
  teamMatchups: (teamKey: string) => `yahoo:allmatchups:${teamKey}`,

  // Scoreboard & Matchups
  scoreboard: (leagueKey: string, week?: number | string) =>
    `yahoo:scoreboard:${leagueKey}:${week || "current"}`,
  matchup: (teamKey: string, week: number) =>
    `yahoo:matchup:${teamKey}:${week}`,

  // Players
  player: (playerKey: string) => `yahoo:player:${playerKey}`,
  playerStats: (playerKey: string, type: string, week?: number) =>
    week
      ? `yahoo:playerstats:${playerKey}:${type}:${week}`
      : `yahoo:playerstats:${playerKey}:${type}`,
  freeAgents: (leagueKey: string, position?: string) =>
    position
      ? `league:${leagueKey}:freeagents:${position}`
      : `league:${leagueKey}:freeagents`,

  // Game
  game: (gameKey: string) => `yahoo:game:${gameKey}`,

  // External
  nbaSchedule: (date: string) => `nba:schedule:${date}`,
  nbaTeamSchedule: (teamAbbr: string) => `nba:team:${teamAbbr}:schedule`,
};
