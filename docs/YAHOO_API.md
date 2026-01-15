# Yahoo API Documentation (Unified)

This document consolidates endpoint specs, request formats, sample structures, and parsing notes from:
- `docs/YAHOO_API_ENDPOINTS.md`
- `docs/YAHOO_API_PARSING.md`
- `docs/YAHOO_API_SAMPLE_STRUCTURES.md`
- `docs/Yahoo_API.txt`

It is the single source of truth for Yahoo Fantasy Sports API usage in this repo.

## Base URL
```
https://fantasysports.yahooapis.com/fantasy/v2
```

## Authentication
- OAuth 2.0 Bearer token.
- Scope: `openid fspt-r` (read access for Fantasy Sports data).
- All requests are `?format=json`.

Example:
```bash
curl "https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}/standings?format=json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Global Parsing Conventions
- All responses are nested under `fantasy_content`.
- Root nodes are usually arrays:
  - `fantasy_content.league` -> array of `[meta, extras]`
  - `fantasy_content.team` -> array of `[meta, extras]`
  - `fantasy_content.users` -> object keyed by numeric strings + `count`
- Collections are objects keyed by numeric strings (`"0"`, `"1"`, ...) plus a `count` field.
- Many objects contain an array of metadata objects that must be merged:
  - `team[0]` -> array of objects (merge into one team object)
  - `player[0]` -> array of objects (merge into one player object)
- See `docs/YAHOO_API_SAMPLE_STRUCTURES.md` for auto-generated full nesting.

## Endpoints

### Game
**Endpoint**
```
GET /game/{game_key}
GET /game/nba
```
**Response path**
```
fantasy_content.game[0]
```
**Notes**
- Flat object with `game_key`, `code`, `season`, etc.

---

### User Leagues
**Endpoint**
```
GET /users;use_login=1/games;game_keys=nba/leagues
```
**Response path**
```
fantasy_content.users["0"].user[1].games["0"].game[1].leagues
```
**Parsing**
- `leagues` is a numeric-key object.
- Each `leagues["0"].league[0]` is the league metadata object.

---

### User Teams
**Endpoint**
```
GET /users;use_login=1/games;game_keys=nba/teams
```
**Response path**
```
fantasy_content.users["0"].user[1].games["0"].game[1].teams
```
**Parsing**
- `teams` is a numeric-key object.
- `teams["0"].team[0]` is an array of metadata objects to merge.

---

### League Metadata
**Endpoint**
```
GET /league/{league_key}
GET /league/{league_key}/metadata
```
**Response path**
```
fantasy_content.league[0]
```
**Notes**
- `league[1]` is empty for this endpoint.

---

### League Settings
**Endpoint**
```
GET /league/{league_key}/settings
```
**Response path**
```
fantasy_content.league[1].settings["0"]
```
**Notes**
- Settings object contains `roster_positions` and `stat_categories`.

---

### League Teams
**Endpoint**
```
GET /league/{league_key}/teams
```
**Response path**
```
fantasy_content.league[1].teams
```
**Parsing**
- `teams` is a numeric-key object.
- `teams["0"].team[0]` is an array of metadata objects to merge.

---

### League Standings
**Endpoint**
```
GET /league/{league_key}/standings
```
**Response path**
```
fantasy_content.league[1].standings["0"].teams
```
**Parsing**
- `teams` is a numeric-key object.
- Each `teams["0"].team` is an array of 3 items:
  - `team[0]` -> metadata array (merge)
  - `team[1]` -> `team_stats`, `team_points`
  - `team[2]` -> `team_standings` (wins/losses/ties)

---

### League Scoreboard (Matchups)
**Endpoint**
```
GET /league/{league_key}/scoreboard
GET /league/{league_key}/scoreboard;week={week_number}
```
**Response path**
```
fantasy_content.league[1].scoreboard["0"].matchups
```
**Parsing**
- `matchups` is a numeric-key object.
- Each `matchups["0"].matchup` is an object (not array).
- Teams are under `matchup["0"].teams`.
- Team structure:
  - `team[0]` -> metadata array (merge)
  - `team[1]` -> `team_stats`, `team_points`, `team_remaining_games`

---

### League Transactions
**Endpoint**
```
GET /league/{league_key}/transactions
GET /league/{league_key}/transactions;types=add,drop,trade;count=25;start=0
```
**Response path**
```
fantasy_content.league[1].transactions
```
**Parsing**
- `transactions` numeric-key object.
- `transaction[0]` is metadata.
- `transaction[1].players` is a numeric-key object.
- Each `players["0"].player` is an array:
  - `player[0]` -> metadata array (merge)
  - `player[1]` -> `transaction_data`

---

### League Draft Results
**Endpoint**
```
GET /league/{league_key}/draftresults
```
**Response path**
```
fantasy_content.league[1].draft_results
```
**Parsing**
- `draft_results` numeric-key object.
- Each `draft_results["0"].draft_result` is a flat object.

---

### League Players (Free Agents / Search)
**Endpoints**
```
GET /league/{league_key}/players;status=FA;count=25;start=0
GET /league/{league_key}/players;search={name}
```
**Response path**
```
fantasy_content.league[1].players
```
**Parsing**
- `players` numeric-key object.
- `players["0"].player[0]` is a metadata array (merge).

---

### Team Metadata
**Endpoint**
```
GET /team/{team_key}
GET /team/{team_key}/metadata
```
**Response path**
```
fantasy_content.team[0]
```
**Parsing**
- `team[0]` is an array of metadata objects (merge).

---

### Team Roster
**Endpoints**
```
GET /team/{team_key}/roster
GET /team/{team_key}/roster;week={week}
GET /team/{team_key}/roster;date={YYYY-MM-DD}
```
**Response path**
```
fantasy_content.team[1].roster
```
**Parsing**
- `roster` is an object with metadata + numeric key `0`.
- Players live under `roster["0"].players`.
- Each `players["0"].player` is an array of 3 items:
  - `player[0]` -> metadata array (merge)
  - `player[1]` -> `selected_position`
  - `player[2]` -> `is_editable`

---

### Team Matchups
**Endpoint**
```
GET /team/{team_key}/matchups
GET /team/{team_key}/matchups;weeks=1,2,3
```
**Response path**
```
fantasy_content.team[1].matchups
```
**Parsing**
- `matchups` numeric-key object.
- Each `matchups["0"].matchup` is an object.
- Teams are under `matchup["0"].teams` (same shape as League Scoreboard).

---

### Team Stats
**Endpoints**
```
GET /team/{team_key}/stats;type=week;week={week}
GET /team/{team_key}/stats;type=season
```
**Response path**
```
fantasy_content.team[1].team_stats.stats
```
**Parsing**
- Each `stats[i].stat` has `stat_id` and `value`.
- `team[1].team_points` may be present.

---

### Player Metadata
**Endpoint**
```
GET /player/{player_key}
GET /player/{player_key}/metadata
```
**Response path**
```
fantasy_content.player[0]
```
**Parsing**
- `player[0]` is an array of metadata objects (merge).
- Sample: `scripts/yahoo-samples/player_api_yahoo_player_466.p.10095.json`.

---

### Player Stats
**Endpoints**
```
GET /player/{player_key}/stats
GET /player/{player_key}/stats;type=week;week={week}
GET /player/{player_key}/stats;type=season
GET /player/{player_key}/stats;type=date;date={YYYY-MM-DD}
```
**Response path**
```
fantasy_content.player[1].player_stats.stats
```
**Parsing**
- Each `stats[i].stat` has `stat_id` and `value`.
- Season responses can include `player_advanced_stats` alongside `player_stats`.
- Week responses can return only player metadata (no `player_stats` array); treat missing stats as empty.

## Related Code
- Parsing logic: `src/lib/yahoo/client.ts`
- Types: `src/lib/yahoo/types.ts`
- API routes: `src/app/api/yahoo/**`
- Sample structures: `docs/YAHOO_API_SAMPLE_STRUCTURES.md`

## Sample Capture
Use the script to refresh sample files:
```bash
cd fantastats
YAHOO_ACCESS_TOKEN=... \
YAHOO_LEAGUE_KEY=... \
YAHOO_TEAM_KEY=... \
YAHOO_PLAYER_KEY=... \
npm run samples:yahoo
```
