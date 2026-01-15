# Yahoo Fantasy Sports API - Endpoints & Models

## Base URL
```
https://fantasysports.yahooapis.com/fantasy/v2
```

## Authentication
- OAuth 2.0 with Bearer token
- Scope: `fspt-r` (Fantasy Sports Read)

---

## 1. GAME Resource

### Get Game Info
```
GET /game/{game_key}
GET /game/nba
```

**Response Model:**
```typescript
interface YahooGame {
  game_key: string;        // e.g., "418" or "nba"
  game_id: string;
  name: string;            // "Basketball"
  code: string;            // "nba"
  type: string;            // "full"
  url: string;
  season: string;          // "2025"
  is_registration_over: boolean;
  is_game_over: boolean;
  is_offseason: boolean;
}
```

---

## 2. USER Resource

### Get User's Leagues (Current Season)
```
GET /users;use_login=1/games;game_keys=nba/leagues
```

**Response Model:**
```typescript
interface UserLeaguesResponse {
  leagues: YahooLeague[];
}
```

### Get User's Teams
```
GET /users;use_login=1/games;game_keys=nba/teams
```

---

## 3. LEAGUE Resource

### Get League Info
```
GET /league/{league_key}
GET /league/{league_key}/metadata
```

**Response Model:**
```typescript
interface YahooLeague {
  league_key: string;       // "418.l.12345"
  league_id: string;
  name: string;
  url: string;
  logo_url?: string;
  draft_status: "predraft" | "drafted" | "postdraft";
  num_teams: number;
  scoring_type: "head" | "roto" | "point" | "headpoint";
  current_week: number;
  start_week: string;
  end_week: string;
  start_date: string;
  end_date: string;
  is_finished: boolean;
  game_code: string;
  season: string;
}
```

### Get League Settings
```
GET /league/{league_key}/settings
```

**Response Model:**
```typescript
interface LeagueSettings {
  draft_type: string;
  is_auction_draft: boolean;
  scoring_type: string;
  roster_positions: RosterPosition[];
  stat_categories: StatCategory[];
  max_teams: number;
  waiver_type: string;
  waiver_rule: string;
  trade_end_date: string;
  trade_review_days: number;
  playoff_start_week: number;
}

interface RosterPosition {
  position: string;           // "PG", "SG", "SF", "PF", "C", "G", "F", "Util", "BN", "IL"
  position_type: string;      // "P" (player), "B" (bench)
  count: number;
}

interface StatCategory {
  stat_id: number;
  name: string;               // "FG%", "FT%", "3PTM", "PTS", "REB", "AST", "STL", "BLK", "TO"
  display_name: string;
  sort_order: "0" | "1";      // "1" = higher is better
  is_only_display_stat: boolean;
}
```

### Get League Standings
```
GET /league/{league_key}/standings
```

**Response Model:**
```typescript
interface LeagueStandings {
  teams: TeamStanding[];
}

interface TeamStanding {
  team_key: string;
  team_id: string;
  name: string;
  rank: number;
  outcome_totals: {
    wins: number;
    losses: number;
    ties: number;
    percentage: string;
  };
  points_for?: number;
  points_against?: number;
}
```

### Get League Scoreboard (Current Week Matchups)
```
GET /league/{league_key}/scoreboard
GET /league/{league_key}/scoreboard;week={week_number}
```

**Response Model:**
```typescript
interface LeagueScoreboard {
  week: number;
  matchups: Matchup[];
}

interface Matchup {
  week: string;
  status: "preevent" | "midevent" | "postevent";
  is_tied: boolean;
  winner_team_key?: string;
  is_playoffs: boolean;
  is_consolation: boolean;
  teams: MatchupTeam[];
}

interface MatchupTeam {
  team_key: string;
  team_id: string;
  name: string;
  url: string;
  team_logo?: string;
  team_points: {
    coverage_type: "week";
    week: number;
    total: string;
  };
  team_projected_points?: {
    coverage_type: "week";
    week: number;
    total: string;
  };
  win_probability?: number;
}
```

### Get League Teams
```
GET /league/{league_key}/teams
```

### Get League Draft Results
```
GET /league/{league_key}/draftresults
```

### Get League Transactions
```
GET /league/{league_key}/transactions
GET /league/{league_key}/transactions;types=add,drop,trade
```

**Response Model:**
```typescript
interface Transaction {
  transaction_key: string;
  type: "add" | "drop" | "add/drop" | "trade" | "waiver";
  status: "successful" | "pending" | "failed";
  timestamp: number;
  players?: TransactionPlayer[];
}

interface TransactionPlayer {
  player_key: string;
  player_id: string;
  name: string;
  transaction_data: {
    type: "add" | "drop";
    source_type: "freeagents" | "waivers" | "team";
    source_team_key?: string;
    destination_type: "freeagents" | "waivers" | "team";
    destination_team_key?: string;
  };
}
```

### Get Free Agents
```
GET /league/{league_key}/players;status=FA
GET /league/{league_key}/players;status=FA;position={position};sort={stat_id};count={count}
```

**Query Parameters:**
- `status`: FA (free agents), W (waivers), T (taken), A (all)
- `position`: PG, SG, SF, PF, C, G, F, Util
- `sort`: stat_id to sort by
- `sort_type`: season, lastweek, lastmonth
- `count`: number of results (max 25)
- `start`: offset for pagination

**Response Model:**
```typescript
interface FreeAgent {
  player_key: string;
  player_id: string;
  name: {
    full: string;
    first: string;
    last: string;
  };
  editorial_team_abbr: string;
  editorial_team_full_name: string;
  display_position: string;
  eligible_positions: string[];
  status?: string;              // "INJ", "GTD", "O", "DTD"
  status_full?: string;
  injury_note?: string;
  percent_owned?: number;
  image_url?: string;
}
```

---

## 4. TEAM Resource

### Get Team Info
```
GET /team/{team_key}
GET /team/{team_key}/metadata
```

**Response Model:**
```typescript
interface YahooTeam {
  team_key: string;           // "418.l.12345.t.1"
  team_id: string;
  name: string;
  url: string;
  team_logos?: TeamLogo[];
  waiver_priority?: number;
  faab_balance?: number;
  number_of_moves?: number;
  number_of_trades?: number;
  managers: Manager[];
  is_owned_by_current_login?: boolean;
  roster?: Roster;
  team_points?: TeamPoints;
  team_standings?: TeamStandings;
}

interface Manager {
  manager_id: string;
  nickname: string;
  guid: string;
  is_current_login?: boolean;
  image_url?: string;
}
```

### Get Team Roster
```
GET /team/{team_key}/roster
GET /team/{team_key}/roster;week={week}
GET /team/{team_key}/roster;date={YYYY-MM-DD}     // For NBA daily
GET /team/{team_key}/roster/players
```

**Response Model:**
```typescript
interface Roster {
  coverage_type: "week" | "date";
  week?: number;
  date?: string;
  players: RosterPlayer[];
}

interface RosterPlayer {
  player_key: string;
  player_id: string;
  name: {
    full: string;
    first: string;
    last: string;
  };
  editorial_team_abbr: string;
  editorial_team_full_name: string;
  display_position: string;
  eligible_positions: string[];
  selected_position: {
    coverage_type: string;
    position: string;
  };
  status?: string;
  status_full?: string;
  injury_note?: string;
  image_url?: string;
  is_undroppable?: boolean;
  starting_status?: {
    is_starting: boolean;
    coverage_type: string;
    date?: string;
  };
}
```

### Get Team Stats
```
GET /team/{team_key}/stats
GET /team/{team_key}/stats;type=week;week={week}
GET /team/{team_key}/stats;type=season
```

### Get Team Matchups
```
GET /team/{team_key}/matchups
GET /team/{team_key}/matchups;weeks=1,2,3
```

---

## 5. PLAYER Resource

### Get Player Info
```
GET /player/{player_key}
GET /player/{player_key}/metadata
```

**Player Key Format:** `{game_key}.p.{player_id}` (e.g., "418.p.5764")

**Response Model:**
```typescript
interface YahooPlayer {
  player_key: string;
  player_id: string;
  name: {
    full: string;
    first: string;
    last: string;
    ascii_first: string;
    ascii_last: string;
  };
  editorial_player_key: string;    // "nba.p.5764"
  editorial_team_key: string;      // "nba.t.13"
  editorial_team_full_name: string;
  editorial_team_abbr: string;
  uniform_number?: string;
  display_position: string;
  image_url?: string;
  is_undroppable: boolean;
  position_type: string;
  eligible_positions: string[];
  has_player_notes?: boolean;
  has_recent_player_notes?: boolean;
  status?: string;
  status_full?: string;
  injury_note?: string;
  percent_owned?: {
    coverage_type: string;
    value: number;
  };
}
```

### Get Player Stats
```
GET /player/{player_key}/stats
GET /player/{player_key}/stats;type=week;week={week}
GET /player/{player_key}/stats;type=season
GET /player/{player_key}/stats;type=date;date={YYYY-MM-DD}
```

**Response Model:**
```typescript
interface PlayerStats {
  coverage_type: "season" | "week" | "date";
  season?: string;
  week?: number;
  date?: string;
  stats: Stat[];
}

interface Stat {
  stat_id: number;
  value: string;
}
```

### Search Players
```
GET /league/{league_key}/players;search={name}
```

---

## 6. ROSTER Operations (PUT)

### Update Roster Positions
```
PUT /team/{team_key}/roster
```

**Request Body (NBA - Date Based):**
```xml
<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>date</coverage_type>
    <date>2025-01-06</date>
    <players>
      <player>
        <player_key>418.p.5764</player_key>
        <position>PG</position>
      </player>
      <player>
        <player_key>418.p.6014</player_key>
        <position>BN</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```

---

## 7. TRANSACTION Operations (POST)

### Add Player
```
POST /league/{league_key}/transactions
```

**Request Body:**
```xml
<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>add</type>
    <player>
      <player_key>418.p.5764</player_key>
      <transaction_data>
        <type>add</type>
        <destination_team_key>418.l.12345.t.1</destination_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

### Drop Player
```
POST /league/{league_key}/transactions
```

**Request Body:**
```xml
<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>drop</type>
    <player>
      <player_key>418.p.5764</player_key>
      <transaction_data>
        <type>drop</type>
        <source_team_key>418.l.12345.t.1</source_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

### Add/Drop (Single Transaction)
```
POST /league/{league_key}/transactions
```

**Request Body:**
```xml
<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <players>
      <player>
        <player_key>418.p.5764</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>418.l.12345.t.1</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>418.p.6014</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>418.l.12345.t.1</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

---

## Common Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `format` | Response format | `json` or `xml` (default) |
| `out` | Include sub-resources | `out=stats,metadata` |
| `week` | Filter by week (NFL) | `week=12` |
| `date` | Filter by date (NBA/MLB/NHL) | `date=2025-01-06` |
| `status` | Player status filter | `FA`, `W`, `T`, `A` |
| `position` | Position filter | `PG`, `SG`, `SF`, `PF`, `C` |
| `sort` | Sort by stat | `sort=15` (points stat_id) |
| `count` | Results per page | `count=25` |
| `start` | Pagination offset | `start=0` |

---

## NBA Stat IDs (Common)

| Stat ID | Name |
|---------|------|
| 0 | Games Played (GP) |
| 1 | Games Started (GS) |
| 2 | Minutes Played (MIN) |
| 5 | Field Goals Made (FGM) |
| 6 | Field Goals Attempted (FGA) |
| 8 | Field Goal % (FG%) |
| 9 | Free Throws Made (FTM) |
| 10 | Free Throws Attempted (FTA) |
| 11 | Free Throw % (FT%) |
| 12 | 3-Pointers Made (3PM) |
| 13 | 3-Pointers Attempted (3PA) |
| 15 | Points (PTS) |
| 16 | Offensive Rebounds (OREB) |
| 17 | Defensive Rebounds (DREB) |
| 18 | Rebounds (REB) |
| 19 | Assists (AST) |
| 20 | Steals (STL) |
| 21 | Blocks (BLK) |
| 22 | Turnovers (TO) |
| 24 | Personal Fouls (PF) |
| 27 | Double-Doubles (DD) |
| 28 | Triple-Doubles (TD) |

---

## Available Operations Summary

| Resource | GET | PUT | POST | DELETE |
|----------|-----|-----|------|--------|
| Game | ✅ | - | - | - |
| League | ✅ | - | - | - |
| League/Scoreboard | ✅ | - | - | - |
| League/Standings | ✅ | - | - | - |
| League/Settings | ✅ | - | - | - |
| League/Teams | ✅ | - | - | - |
| League/Players | ✅ | - | - | - |
| League/Transactions | ✅ | - | ✅ | - |
| Team | ✅ | - | - | - |
| Team/Roster | ✅ | ✅ | - | - |
| Team/Stats | ✅ | - | - | - |
| Team/Matchups | ✅ | - | - | - |
| Player | ✅ | - | - | - |
| Player/Stats | ✅ | - | - | - |
| Transaction | ✅ | ✅ | - | ✅ |

---

## Page Feature Mapping

Based on the API capabilities, here's what each page can show:

### Home (Dashboard)
- `GET /users;use_login=1/games;game_keys=nba/leagues` → User's leagues
- `GET /league/{key}/scoreboard` → Current week matchups for each league

### My Team Tab
- `GET /team/{key}/roster` → Current roster
- `GET /team/{key}/stats` → Team stats
- `PUT /team/{key}/roster` → Edit lineup positions

### Matchups Tab  
- `GET /team/{key}/matchups` → Season matchup history
- `GET /league/{key}/scoreboard` → Current matchup details

### Standings Tab
- `GET /league/{key}/standings` → Full league standings

### Free Agents Tab
- `GET /league/{key}/players;status=FA` → Available players
- `POST /league/{key}/transactions` → Add/Drop players

### Schedule Tab
- External NBA schedule API (not from Yahoo)
- Cross-reference with roster for games-per-day

### Transactions Tab
- `GET /league/{key}/transactions` → Recent league transactions
