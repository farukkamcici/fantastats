# Yahoo API Sample Structures

Generated from `scripts/yahoo-samples/_summary.json` and sample JSON files.
Max depth: 8

## Game
Endpoint: `/game/nba`
Sample file: `scripts/yahoo-samples/game_api_yahoo_game_nba.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/game/nba"
    - game: array (length 1)
      - [0]: object
        - game_key: "466"
        - game_id: "466"
        - name: "Basketball"
        - code: "nba"
        - type: "full"
        - url: "https://basketball.fantasysports.yahoo.com/nba"
        - season: "2025"
        - is_registration_over: 0
        - is_game_over: 0
        - is_offseason: 0
    - time: "17.260074615479ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## User Leagues
Endpoint: `/users;use_login=1/games;game_keys=nba/leagues`
Sample file: `scripts/yahoo-samples/leagues_api_yahoo_leagues.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/users;use_login=1/games;game_keys=nba/leagues"
    - users: object
      - 0: object
        - user: array (length 2)
          - [0]: object
            - guid: "GBBDRKNNIJ46SDETCZ6DLAEBIA"
      - count: 1
    - time: "45.990943908691ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## User Teams
Endpoint: `/users;use_login=1/games;game_keys=nba/teams`
Sample file: `scripts/yahoo-samples/user-teams_api_yahoo_user_teams.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/users;use_login=1/games;game_keys=nba/teams"
    - users: object
      - 0: object
        - user: array (length 2)
          - [0]: object
            - guid: "GBBDRKNNIJ46SDETCZ6DLAEBIA"
      - count: 1
    - time: "66.885948181152ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League
Endpoint: `/league/466.l.175298`
Sample file: `scripts/yahoo-samples/league_api_yahoo_leagues_466.l.175298.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298"
    - league: array (length 1)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "29.563903808594ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Settings
Endpoint: `/league/466.l.175298/settings`
Sample file: `scripts/yahoo-samples/league-settings_api_yahoo_leagues_466.l.175298_settings.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/settings"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "28.399229049683ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Standings
Endpoint: `/league/466.l.175298/standings`
Sample file: `scripts/yahoo-samples/league-standings_api_yahoo_leagues_466.l.175298_standings.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/standings"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "164.87884521484ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Scoreboard
Endpoint: `/league/466.l.175298/scoreboard`
Sample file: `scripts/yahoo-samples/league-scoreboard_api_yahoo_leagues_466.l.175298_scoreboard.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/scoreboard"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "191.32113456726ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Scoreboard Week 1
Endpoint: `/league/466.l.175298/scoreboard;week=1`
Sample file: `scripts/yahoo-samples/league-scoreboard-week_api_yahoo_leagues_466.l.175298_scoreboard_week_1.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/scoreboard;week=1"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "231.66394233704ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Teams
Endpoint: `/league/466.l.175298/teams`
Sample file: `scripts/yahoo-samples/league-teams_api_yahoo_leagues_466.l.175298_teams.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/teams"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "180.3719997406ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Transactions
Endpoint: `/league/466.l.175298/transactions;count=5;start=0`
Sample file: `scripts/yahoo-samples/league-transactions_api_yahoo_leagues_466.l.175298_transactions_count_5_start_0.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/transactions;count=5;start=0"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "35.507917404175ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Draftresults
Endpoint: `/league/466.l.175298/draftresults`
Sample file: `scripts/yahoo-samples/league-draftresults_api_yahoo_leagues_466.l.175298_draftresults.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/draftresults"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "32.190084457397ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Players Fa
Endpoint: `/league/466.l.175298/players;status=FA;count=5;start=0`
Sample file: `scripts/yahoo-samples/league-players-fa_api_yahoo_leagues_466.l.175298_players_status_FA_count_5_start_0.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/players;status=FA;count=5;start=0"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "54.510116577148ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## League Players Search
Endpoint: `/league/466.l.175298/players;search=jokic`
Sample file: `scripts/yahoo-samples/league-players-search_api_yahoo_leagues_466.l.175298_players_search_jokic.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/league/466.l.175298/players;search=jokic"
    - league: array (length 2)
      - [0]: object
        - league_key: "466.l.175298"
        - league_id: "175298"
        - name: "Haftalık Fantezi - Sezon 3 🏀"
        - url: "https://basketball.fantasysports.yahoo.com/nba/175298"
        - logo_url: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-l..."
        - password: ""
        - draft_status: "postdraft"
        - num_teams: 12
        - edit_key: "2026-01-15"
        - weekly_deadline: "intraday"
        - roster_type: "date"
        - league_update_timestamp: "1768467049"
        - scoring_type: "head"
        - league_type: "private"
        - renew: ""
        - renewed: ""
        - felo_tier: "silver"
        - is_highscore: false
        - matchup_week: 13
        - iris_group_chat_id: ""
        - short_invitation_url: "https://basketball.fantasysports.yahoo.com/nba/175298/invitation?key=2ddaeddf..."
        - allow_add_to_dl_extra_pos: 1
        - is_pro_league: "0"
        - is_cash_league: "0"
        - current_week: 13
        - start_week: "1"
        - start_date: "2025-10-21"
        - end_week: "21"
        - end_date: "2026-03-22"
        - current_date: "2026-01-15"
        - is_plus_league: "0"
        - game_code: "nba"
        - season: "2025"
    - time: "36.243200302124ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Team
Endpoint: `/team/466.l.175298.t.1`
Sample file: `scripts/yahoo-samples/team_api_yahoo_team_466.l.175298.t.1.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/team/466.l.175298.t.1"
    - team: array (length 1)
      - [0]: array (length 24)
        - [0]: object
          - team_key: "466.l.175298.t.1"
    - time: "41.799068450928ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Team Roster
Endpoint: `/team/466.l.175298.t.1/roster`
Sample file: `scripts/yahoo-samples/roster-current_api_yahoo_roster_466.l.175298.t.1.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/team/466.l.175298.t.1/roster"
    - team: array (length 2)
      - [0]: array (length 24)
        - [0]: object
          - team_key: "466.l.175298.t.1"
    - time: "63.257932662964ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Team Roster Week 1
Endpoint: `/team/466.l.175298.t.1/roster;week=1`
Sample file: `scripts/yahoo-samples/roster-week_api_yahoo_roster_466.l.175298.t.1_week_1.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/team/466.l.175298.t.1/roster;week=1"
    - team: array (length 2)
      - [0]: array (length 24)
        - [0]: object
          - team_key: "466.l.175298.t.1"
    - time: "64.301013946533ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Team Matchups
Endpoint: `/team/466.l.175298.t.1/matchups`
Sample file: `scripts/yahoo-samples/team-matchups_api_yahoo_team_466.l.175298.t.1_matchups.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/team/466.l.175298.t.1/matchups"
    - team: array (length 2)
      - [0]: array (length 24)
        - [0]: object
          - team_key: "466.l.175298.t.1"
    - time: "980.6489944458ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Team Stats Season
Endpoint: `/team/466.l.175298.t.1/stats;type=season`
Sample file: `scripts/yahoo-samples/team-stats-season_api_yahoo_team_466.l.175298.t.1_stats_type_season.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/team/466.l.175298.t.1/stats;type=season"
    - team: array (length 2)
      - [0]: array (length 24)
        - [0]: object
          - team_key: "466.l.175298.t.1"
    - time: "43.575048446655ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Team Stats Week 1
Endpoint: `/team/466.l.175298.t.1/stats;type=week;week=1`
Sample file: `scripts/yahoo-samples/team-stats-week_api_yahoo_team_466.l.175298.t.1_stats_type_week_week_1.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/team/466.l.175298.t.1/stats;type=week;week=1"
    - team: array (length 2)
      - [0]: array (length 24)
        - [0]: object
          - team_key: "466.l.175298.t.1"
    - time: "60.990810394287ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Player
Endpoint: `/player/466.p.10095`
Sample file: `scripts/yahoo-samples/player_api_yahoo_player_466.p.10095.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/player/466.p.10095"
    - player: array (length 1)
      - [0]: array (length 23)
        - [0]: object
          - player_key: "466.p.10095"
    - time: "23.97894859314ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Player Stats Season
Endpoint: `/player/466.p.10095/stats;type=season`
Sample file: `scripts/yahoo-samples/player-stats-season_api_yahoo_player_466.p.10095_stats_type_season.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/player/466.p.10095/stats;type=season"
    - player: array (length 2)
      - [0]: array (length 23)
        - [0]: object
          - player_key: "466.p.10095"
    - time: "28.646945953369ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```

## Player Stats Week 1
Endpoint: `/player/466.p.10095/stats;type=week;week=1`
Sample file: `scripts/yahoo-samples/player-stats-week_api_yahoo_player_466.p.10095_stats_type_week_week_1.json`

Structure:
```
- root: object
  - fantasy_content: object
    - xml:lang: "en-US"
    - yahoo:uri: "/fantasy/v2/player/466.p.10095/stats;type=week;week=1"
    - player: array (length 1)
      - [0]: array (length 23)
        - [0]: object
          - player_key: "466.p.10095"
    - time: "26.238918304443ms"
    - copyright: "Certain Data by Sportradar, Stats Perform and Rotowire"
    - refresh_rate: "60"
```
