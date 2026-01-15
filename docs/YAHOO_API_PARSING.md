# Yahoo API Parsing Guide (Based on Samples)

This guide documents how to parse Yahoo Fantasy API responses based on local samples in `fantastats/scripts/yahoo-samples/`.

General rules:
- Responses are nested under `fantasy_content`.
- `fantasy_content.league`, `fantasy_content.team`, and `fantasy_content.users` are arrays.
- Many collections are objects keyed by numeric strings (`"0"`, `"1"`, ...) plus a `count` field.
- Inside each item, `team`, `player`, `matchup`, and `transaction` are arrays where index `0` is a list of metadata objects that must be merged.

## Game
Endpoint: `GET /game/{game_key}`
Sample: `scripts/yahoo-samples/game_api_yahoo_game_nba.json`
Path:
```
fantasy_content.game[0]
```
Notes:
- Flat object with fields like `game_key`, `code`, `season`.

## User Leagues
Endpoint: `GET /users;use_login=1/games;game_keys=nba/leagues`
Sample: `scripts/yahoo-samples/leagues_api_yahoo_leagues.json`
Path:
```
fantasy_content.users["0"].user[1].games["0"].game[1].leagues
```
Parse:
- `leagues` is an object keyed by numeric strings.
- Each `leagues["0"].league[0]` is the league metadata object.

## User Teams
Endpoint: `GET /users;use_login=1/games;game_keys=nba/teams`
Sample: `scripts/yahoo-samples/user-teams_api_yahoo_user_teams.json`
Path:
```
fantasy_content.users["0"].user[1].games["0"].game[1].teams
```
Parse:
- `teams` is an object keyed by numeric strings.
- Each `teams["0"].team[0]` is an array of metadata objects; merge to a single team object.

## League (metadata)
Endpoint: `GET /league/{league_key}`
Sample: `scripts/yahoo-samples/league_api_yahoo_leagues_466.l.175298.json`
Path:
```
fantasy_content.league[0]
```
Notes:
- `league[1]` is empty for this endpoint.

## League Settings
Endpoint: `GET /league/{league_key}/settings`
Sample: `scripts/yahoo-samples/league-settings_api_yahoo_leagues_466.l.175298_settings.json`
Path:
```
fantasy_content.league[1].settings["0"]
```
Notes:
- Settings object includes `roster_positions` and `stat_categories`.

## League Teams
Endpoint: `GET /league/{league_key}/teams`
Sample: `scripts/yahoo-samples/league-teams_api_yahoo_leagues_466.l.175298_teams.json`
Path:
```
fantasy_content.league[1].teams
```
Parse:
- `teams` is an object keyed by numeric strings.
- Each `teams["0"].team[0]` is an array of metadata objects; merge into one object.
- Only metadata present (no stats).

## League Standings
Endpoint: `GET /league/{league_key}/standings`
Sample: `scripts/yahoo-samples/league-standings_api_yahoo_leagues_466.l.175298_standings.json`
Path:
```
fantasy_content.league[1].standings["0"].teams
```
Parse:
- `teams` is an object keyed by numeric strings.
- Each `teams["0"].team` is an array of 3 items:
  - `team[0]`: metadata array of objects (merge to get `team_key`, `name`, etc).
  - `team[1]`: `{ team_stats, team_points }` object.
  - `team[2]`: `{ team_standings }` object.
- Record: `team_standings.outcome_totals` contains `wins`, `losses`, `ties`.

## League Scoreboard
Endpoint: `GET /league/{league_key}/scoreboard`
Sample: `scripts/yahoo-samples/league-scoreboard_api_yahoo_leagues_466.l.175298_scoreboard.json`
Path:
```
fantasy_content.league[1].scoreboard["0"].matchups
```
Parse:
- `matchups` is an object keyed by numeric strings.
- Each entry: `matchups["0"].matchup` is an object, not an array.
- The team list lives under `matchup["0"].teams`.
- `matchup` also contains fields like `week`, `status`, `is_playoffs`, `is_consolation`, `stat_winners`.

Team parsing inside a matchup:
```
matchup["0"].teams["0"].team
```
- `team[0]`: metadata array of objects (merge to get `team_key`, `name`, `team_logos`).
- `team[1]`: `{ team_stats, team_points, team_remaining_games }` object.

## Team (metadata)
Endpoint: `GET /team/{team_key}`
Sample: `scripts/yahoo-samples/team_api_yahoo_team_466.l.175298.t.1.json`
Path:
```
fantasy_content.team[0]
```
Parse:
- `team[0]` is an array of metadata objects; merge into one object.

## Team Roster (current/week)
Endpoint: `GET /team/{team_key}/roster` or `.../roster;week=1`
Samples:
- `scripts/yahoo-samples/roster-current_api_yahoo_roster_466.l.175298.t.1.json`
- `scripts/yahoo-samples/roster-week_api_yahoo_roster_466.l.175298.t.1_week_1.json`
Path:
```
fantasy_content.team[1].roster
```
Parse:
- `roster` is an object with metadata and a numeric key `0`.
- Players live at `roster["0"].players`.
- Each `players["0"].player` is an array of 3 items:
  - `player[0]`: metadata array of objects (merge to get `player_key`, `name`, `editorial_team_abbr`, etc).
  - `player[1]`: `{ selected_position }`.
  - `player[2]`: `{ is_editable }`.

## Team Matchups
Endpoint: `GET /team/{team_key}/matchups`
Sample: `scripts/yahoo-samples/team-matchups_api_yahoo_team_466.l.175298.t.1_matchups.json`
Path:
```
fantasy_content.team[1].matchups
```
Parse:
- `matchups` is an object keyed by numeric strings.
- Each entry: `matchups["0"].matchup` is an object.
- Team list lives under `matchup["0"].teams`.
- Same team parsing as League Scoreboard.

## Team Stats (week/season)
Endpoints:
- `GET /team/{team_key}/stats;type=week;week=1`
- `GET /team/{team_key}/stats;type=season`
Samples:
- `scripts/yahoo-samples/team-stats-week_api_yahoo_team_466.l.175298.t.1_stats_type_week_week_1.json`
- `scripts/yahoo-samples/team-stats-season_api_yahoo_team_466.l.175298.t.1_stats_type_season.json`
Path:
```
fantasy_content.team[1].team_stats.stats
```
Parse:
- Each `stats[i].stat` has `stat_id` and `value`.
- `team[1].team_points` may exist alongside stats.

## Player Metadata
Endpoint: `GET /player/{player_key}`
Sample: `scripts/yahoo-samples/player_api_yahoo_player_466.p.10095.json`
Path:
```
fantasy_content.player[0]
```
Parse:
- `player[0]` is an array of metadata objects; merge to get `player_key`, `name`, `editorial_team_abbr`, `display_position`, `headshot`, etc.

## Player Stats
Endpoints:
- `GET /player/{player_key}/stats;type=season`
- `GET /player/{player_key}/stats;type=week;week=1`
Samples:
- `scripts/yahoo-samples/player-stats-season_api_yahoo_player_466.p.10095_stats_type_season.json`
- `scripts/yahoo-samples/player-stats-week_api_yahoo_player_466.p.10095_stats_type_week_week_1.json`
Path:
```
fantasy_content.player[1].player_stats.stats
```
Parse:
- Each `stats[i].stat` has `stat_id` and `value`.
- Season responses may include `player_advanced_stats` alongside `player_stats`.
- Week responses can return only player metadata (no `player_stats` array); handle missing stats as empty.

## League Transactions
Endpoint: `GET /league/{league_key}/transactions;count=5;start=0`
Sample: `scripts/yahoo-samples/league-transactions_api_yahoo_leagues_466.l.175298_transactions_count_5_start_0.json`
Path:
```
fantasy_content.league[1].transactions
```
Parse:
- `transactions` is an object keyed by numeric strings.
- Each `transactions["0"].transaction` is an array of 2 items:
  - `transaction[0]`: metadata object (`transaction_key`, `type`, `status`, `timestamp`).
  - `transaction[1]`: `{ players }`.
- `players` is an object keyed by numeric strings.
- Each `players["0"].player` is an array:
  - `player[0]`: metadata array of objects (merge to get `player_key`, `name`).
  - `player[1]`: `{ transaction_data }`.

## League Draft Results
Endpoint: `GET /league/{league_key}/draftresults`
Sample: `scripts/yahoo-samples/league-draftresults_api_yahoo_leagues_466.l.175298_draftresults.json`
Path:
```
fantasy_content.league[1].draft_results
```
Parse:
- Object keyed by numeric strings.
- Each `draft_results["0"].draft_result` is a flat object with `pick`, `round`, `team_key`, `player_key`.

## League Players (Free Agents / Search)
Endpoints:
- `GET /league/{league_key}/players;status=FA;count=5;start=0`
- `GET /league/{league_key}/players;search=jokic`
Samples:
- `scripts/yahoo-samples/league-players-fa_api_yahoo_leagues_466.l.175298_players_status_FA_count_5_start_0.json`
- `scripts/yahoo-samples/league-players-search_api_yahoo_leagues_466.l.175298_players_search_jokic.json`
Path:
```
fantasy_content.league[1].players
```
Parse:
- `players` is an object keyed by numeric strings.
- Each `players["0"].player[0]` is an array of metadata objects; merge to get fields like `player_key`, `editorial_team_abbr`, `display_position`, etc.

## Parsing helpers (recommended)
- Merge a metadata array into a single object by shallow-assigning each object in order.
- Treat numeric-key objects as lists and skip the `count` key.
