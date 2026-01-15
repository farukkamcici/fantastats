import { cache, CACHE_TTL, cacheKey } from "@/lib/redis";
import { NbaGame, NbaGamesResponse } from "./types";

const NBA_API_BASE = "https://api.balldontlie.io/v1";

function toQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join("&")
  );
}

export class NbaClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.BALLDONTLIE_API_KEY;
    if (!key) {
      throw new Error("Missing BALLDONTLIE_API_KEY");
    }
    this.apiKey = key;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${NBA_API_BASE}${endpoint}`, {
      headers: {
        Authorization: this.apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`balldontlie error ${response.status}: ${errorText}`);
    }

    return (await response.json()) as T;
  }

  async getGames(options: {
    startDate: string;
    endDate: string;
    teamIds?: number[];
  }): Promise<NbaGame[]> {
    const { startDate, endDate, teamIds } = options;
    const teamParam = teamIds?.length ? teamIds.join(",") : undefined;
    const cacheKeyValue = cacheKey.nbaSchedule(`${startDate}:${endDate}:${teamParam || "all"}`);

    return cache.getOrSet(cacheKeyValue, async () => {
      let cursor: number | null | undefined = undefined;
      const games: NbaGame[] = [];

      do {
        const endpoint =
          "/games" +
          toQuery({
            "start_date": startDate,
            "end_date": endDate,
            "team_ids[]": teamIds?.[0],
            "per_page": 100,
            "cursor": cursor ?? undefined,
          });

        const response = await this.request<NbaGamesResponse>(endpoint);
        games.push(...response.data);
        cursor = response.meta?.next_cursor ?? null;
      } while (cursor);

      return games;
    }, CACHE_TTL.NBA_SCHEDULE);
  }
}
