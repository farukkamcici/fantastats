import process from "node:process";

const accessToken = process.env.YAHOO_ACCESS_TOKEN;
const leagueKey = process.env.YAHOO_LEAGUE_KEY;
const teamKey = process.env.YAHOO_TEAM_KEY;

if (!accessToken || !leagueKey) {
  console.error("Missing YAHOO_ACCESS_TOKEN or YAHOO_LEAGUE_KEY in env.");
  process.exit(1);
}

const BASE = "https://fantasysports.yahooapis.com/fantasy/v2";

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

async function main() {
  console.log("Inspecting Yahoo endpoints...");

  const scoreboard = await fetchJson(`/league/${leagueKey}/scoreboard`);
  console.log("Scoreboard keys:", Object.keys(scoreboard.fantasy_content || {}));

  const standings = await fetchJson(`/league/${leagueKey}/standings`);
  console.log("Standings keys:", Object.keys(standings.fantasy_content || {}));

  if (teamKey) {
    const roster = await fetchJson(`/team/${teamKey}/roster`);
    console.log("Roster keys:", Object.keys(roster.fantasy_content || {}));

    const matchups = await fetchJson(`/team/${teamKey}/matchups`);
    console.log("Matchups keys:", Object.keys(matchups.fantasy_content || {}));
  } else {
    console.log("Skipping team endpoints. Set YAHOO_TEAM_KEY to inspect roster/matchups.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
