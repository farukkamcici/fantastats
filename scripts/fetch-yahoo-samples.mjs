import fs from "node:fs/promises";
import path from "node:path";

const BASE = "https://fantasysports.yahooapis.com/fantasy/v2";

const accessToken = process.env.YAHOO_ACCESS_TOKEN;
const leagueKey = process.env.YAHOO_LEAGUE_KEY;
const teamKey = process.env.YAHOO_TEAM_KEY;
const playerKey = process.env.YAHOO_PLAYER_KEY;
const gameKey = process.env.YAHOO_GAME_KEY || "nba";
const searchTerm = process.env.YAHOO_SEARCH_TERM || "jokic";

if (!accessToken) {
  console.error("Missing YAHOO_ACCESS_TOKEN in environment.");
  process.exit(1);
}

const outputDir = path.join(process.cwd(), "scripts", "yahoo-samples");

const endpoints = [
  {
    id: "game",
    endpoint: `/game/${gameKey}`,
    filename: `game_api_yahoo_game_${gameKey}.json`,
    requires: [],
  },
  {
    id: "user-leagues",
    endpoint: `/users;use_login=1/games;game_keys=nba/leagues`,
    filename: "leagues_api_yahoo_leagues.json",
    requires: [],
  },
  {
    id: "user-teams",
    endpoint: `/users;use_login=1/games;game_keys=nba/teams`,
    filename: "user-teams_api_yahoo_user_teams.json",
    requires: [],
  },
  {
    id: "league",
    endpoint: `/league/${leagueKey}`,
    filename: `league_api_yahoo_leagues_${leagueKey}.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-settings",
    endpoint: `/league/${leagueKey}/settings`,
    filename: `league-settings_api_yahoo_leagues_${leagueKey}_settings.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-standings",
    endpoint: `/league/${leagueKey}/standings`,
    filename: `league-standings_api_yahoo_leagues_${leagueKey}_standings.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-scoreboard",
    endpoint: `/league/${leagueKey}/scoreboard`,
    filename: `league-scoreboard_api_yahoo_leagues_${leagueKey}_scoreboard.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-scoreboard-week-1",
    endpoint: `/league/${leagueKey}/scoreboard;week=1`,
    filename: `league-scoreboard-week_api_yahoo_leagues_${leagueKey}_scoreboard_week_1.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-teams",
    endpoint: `/league/${leagueKey}/teams`,
    filename: `league-teams_api_yahoo_leagues_${leagueKey}_teams.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-transactions",
    endpoint: `/league/${leagueKey}/transactions;count=5;start=0`,
    filename: `league-transactions_api_yahoo_leagues_${leagueKey}_transactions_count_5_start_0.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-draftresults",
    endpoint: `/league/${leagueKey}/draftresults`,
    filename: `league-draftresults_api_yahoo_leagues_${leagueKey}_draftresults.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-players-fa",
    endpoint: `/league/${leagueKey}/players;status=FA;count=5;start=0`,
    filename: `league-players-fa_api_yahoo_leagues_${leagueKey}_players_status_FA_count_5_start_0.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "league-players-search",
    endpoint: `/league/${leagueKey}/players;search=${encodeURIComponent(searchTerm)}`,
    filename: `league-players-search_api_yahoo_leagues_${leagueKey}_players_search_${searchTerm}.json`,
    requires: ["YAHOO_LEAGUE_KEY"],
  },
  {
    id: "team",
    endpoint: `/team/${teamKey}`,
    filename: `team_api_yahoo_team_${teamKey}.json`,
    requires: ["YAHOO_TEAM_KEY"],
  },
  {
    id: "team-roster",
    endpoint: `/team/${teamKey}/roster`,
    filename: `roster-current_api_yahoo_roster_${teamKey}.json`,
    requires: ["YAHOO_TEAM_KEY"],
  },
  {
    id: "team-roster-week-1",
    endpoint: `/team/${teamKey}/roster;week=1`,
    filename: `roster-week_api_yahoo_roster_${teamKey}_week_1.json`,
    requires: ["YAHOO_TEAM_KEY"],
  },
  {
    id: "team-matchups",
    endpoint: `/team/${teamKey}/matchups`,
    filename: `team-matchups_api_yahoo_team_${teamKey}_matchups.json`,
    requires: ["YAHOO_TEAM_KEY"],
  },
  {
    id: "team-stats-season",
    endpoint: `/team/${teamKey}/stats;type=season`,
    filename: `team-stats-season_api_yahoo_team_${teamKey}_stats_type_season.json`,
    requires: ["YAHOO_TEAM_KEY"],
  },
  {
    id: "team-stats-week-1",
    endpoint: `/team/${teamKey}/stats;type=week;week=1`,
    filename: `team-stats-week_api_yahoo_team_${teamKey}_stats_type_week_week_1.json`,
    requires: ["YAHOO_TEAM_KEY"],
  },
  {
    id: "player",
    endpoint: `/player/${playerKey}`,
    filename: `player_api_yahoo_player_${playerKey}.json`,
    requires: ["YAHOO_PLAYER_KEY"],
  },
  {
    id: "player-stats-season",
    endpoint: `/player/${playerKey}/stats;type=season`,
    filename: `player-stats-season_api_yahoo_player_${playerKey}_stats_type_season.json`,
    requires: ["YAHOO_PLAYER_KEY"],
  },
  {
    id: "player-stats-week-1",
    endpoint: `/player/${playerKey}/stats;type=week;week=1`,
    filename: `player-stats-week_api_yahoo_player_${playerKey}_stats_type_week_week_1.json`,
    requires: ["YAHOO_PLAYER_KEY"],
  },
];

async function fetchJson(endpoint) {
  const response = await fetch(`${BASE}${endpoint}?format=json`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Yahoo API error ${response.status}: ${text}`);
  }

  return response.json();
}

async function ensureDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function writeJson(file, data) {
  const filepath = path.join(outputDir, file);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
}

async function main() {
  await ensureDir();

  const summary = {
    generatedAt: new Date().toISOString(),
    endpoints: [],
  };

  for (const entry of endpoints) {
    const missing = entry.requires.filter((envKey) => !process.env[envKey]);
    if (missing.length > 0) {
      summary.endpoints.push({
        id: entry.id,
        endpoint: entry.endpoint,
        status: "skipped",
        reason: `Missing ${missing.join(", ")}`,
      });
      continue;
    }

    try {
      const data = await fetchJson(entry.endpoint);
      await writeJson(entry.filename, data);
      summary.endpoints.push({
        id: entry.id,
        endpoint: entry.endpoint,
        status: "ok",
        file: entry.filename,
      });
    } catch (error) {
      summary.endpoints.push({
        id: entry.id,
        endpoint: entry.endpoint,
        status: "error",
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await writeJson("_summary.json", summary);
  console.log(`Saved ${summary.endpoints.length} entries to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
