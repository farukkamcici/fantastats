import { Redis } from '@upstash/redis';

// Initialize Redis from environment variables
// Uses: KV_REST_API_URL and KV_REST_API_TOKEN
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
  },

  /**
   * Set cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    await redis.setex(key, ttlSeconds, value);
  },

  /**
   * Get from cache
   */
  async get<T>(key: string): Promise<T | null> {
    return await redis.get<T>(key);
  },

  /**
   * Delete from cache
   */
  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  /**
   * Clear all cache with pattern (careful!)
   */
  async clearPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Cache TTL presets (in seconds)
export const CACHE_TTL = {
  LEAGUE_SETTINGS: 60 * 60 * 24,    // 24 hours - rarely changes
  SETTINGS: 60 * 60 * 24,           // Alias for LEAGUE_SETTINGS
  STANDINGS: 60 * 60,                // 1 hour
  ROSTER: 60 * 15,                   // 15 minutes
  PLAYER_STATS: 60 * 30,             // 30 minutes
  PLAYERS: 60 * 30,                  // 30 minutes - alias for player data
  FREE_AGENTS: 60 * 10,              // 10 minutes - changes frequently
  SCOREBOARD: 60 * 5,                // 5 minutes
  MATCHUP: 60 * 5,                   // 5 minutes - same as scoreboard
  NBA_SCHEDULE: 60 * 60 * 6,         // 6 hours
};

// Cache key generators
export const cacheKey = {
  userLeagues: (userId: string) => `user:${userId}:leagues`,
  leagues: (userId: string) => `yahoo:leagues:${userId}`,
  leagueSettings: (leagueKey: string) => `league:${leagueKey}:settings`,
  leagueStandings: (leagueKey: string) => `league:${leagueKey}:standings`,
  teamRoster: (teamKey: string) => `team:${teamKey}:roster`,
  team: (userId: string, leagueKey: string) => `yahoo:team:${userId}:${leagueKey}`,
  roster: (teamKey: string, week?: number) => week ? `yahoo:roster:${teamKey}:${week}` : `yahoo:roster:${teamKey}`,
  teamStats: (teamKey: string, type: string) => `team:${teamKey}:stats:${type}`,
  scoreboard: (leagueKey: string, week: number) => `league:${leagueKey}:scoreboard:${week}`,
  matchup: (teamKey: string, week: number) => `yahoo:matchup:${teamKey}:${week}`,
  freeAgents: (leagueKey: string, position?: string) => position ? `league:${leagueKey}:freeagents:${position}` : `league:${leagueKey}:freeagents`,
  nbaSchedule: (date: string) => `nba:schedule:${date}`,
  nbaTeamSchedule: (teamAbbr: string) => `nba:team:${teamAbbr}:schedule`,
};
