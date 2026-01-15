/**
 * Yahoo Fantasy Sports API Types
 * 
 * Based on Yahoo Fantasy Sports API documentation
 * https://developer.yahoo.com/fantasysports/guide/
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface YahooApiResponse<T> {
  fantasy_content: T;
}

export interface YahooError {
  error: {
    description: string;
    detail?: string;
  };
}

// =============================================================================
// USER & GAMES
// =============================================================================

export interface YahooUser {
  guid: string;
  games: YahooGame[];
}

export interface YahooGame {
  game_key: string;
  game_id: string;
  name: string;
  code: string; // 'nba', 'nfl', etc.
  type: string;
  url: string;
  season: string;
  is_registration_over: boolean;
  is_game_over: boolean;
  is_offseason: boolean;
  leagues?: YahooLeague[];
}

// =============================================================================
// LEAGUE
// =============================================================================

export interface YahooLeague {
  league_key: string;
  league_id: string;
  name: string;
  url: string;
  logo_url?: string;
  draft_status: string;
  num_teams: number;
  edit_key: string;
  weekly_deadline: string;
  league_update_timestamp: string;
  scoring_type: string; // 'head', 'roto', 'point', 'headone', 'headpoint'
  league_type: string;
  renew?: string;
  renewed?: string;
  iris_group_chat_id?: string;
  allow_add_to_dl_extra_pos: boolean;
  is_pro_league: boolean;
  is_cash_league: boolean;
  current_week: number;
  start_week: string;
  start_date: string;
  end_week: string;
  end_date: string;
  is_finished?: boolean;
  game_code: string;
  season: string;
  settings?: YahooLeagueSettings;
  standings?: YahooStandings;
  scoreboard?: YahooScoreboard;
  teams?: YahooTeam[];
}

export interface YahooLeagueSettings {
  draft_type: string;
  is_auction_draft: boolean;
  scoring_type: string;
  persistent_url: string;
  uses_playoff: boolean;
  has_playoff_consolation_games: boolean;
  playoff_start_week: number;
  uses_playoff_reseeding: boolean;
  uses_lock_eliminated_teams: boolean;
  num_playoff_teams: number;
  num_playoff_consolation_teams: number;
  has_multiweek_championship: boolean;
  waiver_type: string;
  waiver_rule: string;
  uses_faab: boolean;
  draft_time?: string;
  draft_pick_time?: string;
  post_draft_players: string;
  max_teams: number;
  waiver_time?: string;
  trade_end_date?: string;
  trade_ratify_type: string;
  trade_reject_time?: string;
  player_pool: string;
  cant_cut_list: string;
  is_publicly_viewable: boolean;
  roster_positions: YahooRosterPosition[];
  stat_categories: YahooStatCategory[];
  stat_modifiers?: YahooStatModifier[];
  max_weekly_adds?: number;
  uses_median_score?: boolean;
  league_premium_features?: string[];
}

export interface YahooRosterPosition {
  position: string;
  position_type: string;
  count: number;
  is_starting_position?: boolean;
}

export interface YahooStatCategory {
  stat_id: number;
  enabled: boolean;
  name: string;
  display_name: string;
  sort_order: string; // '0' = lower is better, '1' = higher is better
  position_type: string;
  stat_position_types?: { position_type: string }[];
  is_only_display_stat?: boolean;
}

export interface YahooStatModifier {
  stat_id: number;
  value: string;
}

// =============================================================================
// STANDINGS
// =============================================================================

export interface YahooStandings {
  teams: YahooTeamStanding[];
}

export interface YahooTeamStanding {
  team: YahooTeam;
  team_standings: {
    rank: number;
    playoff_seed?: string;
    outcome_totals: {
      wins: number;
      losses: number;
      ties: number;
      percentage: string;
    };
    streak?: {
      type: string;
      value: string;
    };
    points_for?: string;
    points_against?: string;
  };
}

// =============================================================================
// TEAM
// =============================================================================

export interface YahooTeam {
  team_key: string;
  team_id: string;
  name: string;
  is_owned_by_current_login: boolean;
  url: string;
  team_logos?: { team_logo: { size: string; url: string } }[];
  waiver_priority?: number;
  faab_balance?: number;
  number_of_moves?: number;
  number_of_trades?: number;
  roster_adds?: {
    coverage_type: string;
    coverage_value: number;
    value: number;
  };
  league_scoring_type?: string;
  has_draft_grade?: boolean;
  managers?: YahooManager[];
  roster?: YahooRoster;
  team_stats?: YahooTeamStats;
  team_points?: YahooTeamPoints;
  matchups?: YahooMatchup[];
}

export interface YahooManager {
  manager_id: string;
  nickname: string;
  guid: string;
  is_commissioner?: boolean;
  is_current_login?: boolean;
  email?: string;
  image_url?: string;
}

// =============================================================================
// ROSTER
// =============================================================================

export interface YahooRoster {
  coverage_type: string;
  week?: number;
  date?: string;
  is_editable?: boolean;
  players: YahooPlayer[];
}

export interface YahooPlayer {
  player_key: string;
  player_id: string;
  name: {
    full: string;
    first: string;
    last: string;
    ascii_first: string;
    ascii_last: string;
  };
  url: string;
  editorial_player_key: string;
  editorial_team_key: string;
  editorial_team_full_name: string;
  editorial_team_abbr: string; // e.g., "LAL", "GSW"
  editorial_team_url?: string;
  bye_weeks?: { week: string }[];
  uniform_number?: string;
  display_position: string;
  headshot?: {
    url: string;
    size: string;
  };
  image_url?: string;
  is_undroppable: boolean;
  position_type: string;
  primary_position: string;
  eligible_positions: string[];
  has_player_notes?: boolean;
  player_notes_last_timestamp?: number;
  selected_position?: {
    coverage_type: string;
    week?: number;
    date?: string;
    position: string;
    is_flex?: boolean;
  };
  starting_status?: {
    coverage_type: string;
    week?: number;
    date?: string;
    is_starting: boolean;
  };
  transaction_data?: {
    type: string;
    source_type: string;
    destination_type: string;
    destination_team_key?: string;
    destination_team_name?: string;
  };
  percent_owned?: {
    coverage_type: string;
    week?: number;
    value: number;
    delta?: number;
  };
  ownership?: {
    ownership_type: string;
    owner_team_key?: string;
    owner_team_name?: string;
  };
  draft_analysis?: {
    average_pick: string;
    average_round: string;
    average_cost: string;
    percent_drafted: string;
  };
  player_stats?: YahooPlayerStats;
  player_points?: YahooPlayerPoints;
  player_advanced_stats?: YahooPlayerAdvancedStats;
  status?: string; // 'IR', 'O', 'GTD', 'INJ', etc.
  status_full?: string;
  injury_note?: string;
  on_disabled_list?: boolean;
}

// =============================================================================
// STATS
// =============================================================================

export interface YahooPlayerStats {
  coverage_type: string;
  season?: string;
  date?: string;
  week?: number;
  stats: YahooStat[];
}

export interface YahooStat {
  stat_id: number;
  value: string;
}

export interface YahooPlayerPoints {
  coverage_type: string;
  season?: string;
  week?: number;
  total: string;
}

export interface YahooPlayerAdvancedStats {
  coverage_type: string;
  season?: string;
  stats: YahooStat[];
}

export interface YahooTeamStats {
  coverage_type: string;
  week?: number;
  stats: YahooStat[];
}

export interface YahooTeamPoints {
  coverage_type: string;
  week?: number;
  total: string;
}

// =============================================================================
// MATCHUP
// =============================================================================

export interface YahooScoreboard {
  week: number;
  matchups: YahooMatchup[];
}

export interface YahooMatchup {
  week: number;
  week_start: string;
  week_end: string;
  status: string; // 'postevent', 'midevent', 'preevent'
  is_playoffs: boolean;
  is_consolation: boolean;
  is_tied?: boolean;
  winner_team_key?: string;
  teams: YahooMatchupTeam[];
  stat_winners?: YahooStatWinner[];
}

export interface YahooMatchupTeam {
  team: YahooTeam;
  team_points?: YahooTeamPoints;
  team_stats?: YahooTeamStats;
  team_projected_points?: YahooTeamPoints;
  win_probability?: number;
}

export interface YahooStatWinner {
  stat_id: number;
  winner_team_key: string;
  is_tied?: boolean;
}

// =============================================================================
// TRANSACTIONS
// =============================================================================

export interface YahooTransaction {
  transaction_key: string;
  transaction_id: string;
  type: string; // 'add', 'drop', 'add/drop', 'trade'
  status: string;
  timestamp: string;
  players?: YahooTransactionPlayer[];
}

export interface YahooTransactionPlayer {
  player: YahooPlayer;
  transaction_data: {
    type: string;
    source_type: string;
    source_team_key?: string;
    source_team_name?: string;
    destination_type: string;
    destination_team_key?: string;
    destination_team_name?: string;
  };
}

// =============================================================================
// DRAFT
// =============================================================================

export interface YahooDraftResult {
  pick: number;
  round: number;
  team_key: string;
  player_key: string;
}

// =============================================================================
// STAT ID MAPPINGS (NBA)
// =============================================================================

export const NBA_STAT_IDS = {
  // Counting Stats
  GAMES_PLAYED: 0,
  GAMES_STARTED: 1,
  MINUTES: 2,
  FIELD_GOALS_ATTEMPTED: 3,
  FIELD_GOALS_MADE: 4,
  FIELD_GOAL_PERCENTAGE: 5,
  FREE_THROWS_ATTEMPTED: 6,
  FREE_THROWS_MADE: 7,
  FREE_THROW_PERCENTAGE: 8,
  THREE_POINTERS_ATTEMPTED: 9,
  THREE_POINTERS_MADE: 10,
  THREE_POINT_PERCENTAGE: 11,
  POINTS: 12,
  OFFENSIVE_REBOUNDS: 13,
  DEFENSIVE_REBOUNDS: 14,
  REBOUNDS: 15,
  ASSISTS: 16,
  STEALS: 17,
  BLOCKS: 18,
  TURNOVERS: 19,
  PERSONAL_FOULS: 20,
  TECHNICAL_FOULS: 21,
  EJECTIONS: 22,
  FLAGRANT_FOULS: 23,
  DOUBLE_DOUBLES: 24,
  TRIPLE_DOUBLES: 25,
  ASSISTS_TURNOVERS_RATIO: 26,
} as const;

export type NbaStatId = typeof NBA_STAT_IDS[keyof typeof NBA_STAT_IDS];

// =============================================================================
// API RESPONSE HELPERS
// =============================================================================

export interface LeaguesResponse {
  users: {
    user: YahooUser[];
  };
}

export interface LeagueResponse {
  league: YahooLeague[];
}

export interface TeamResponse {
  team: YahooTeam[];
}

export interface RosterResponse {
  team: {
    roster: YahooRoster;
  }[];
}

export interface PlayersResponse {
  league: {
    players: YahooPlayer[];
  }[];
}

export interface MatchupResponse {
  team: {
    matchups: {
      matchup: YahooMatchup[];
    };
  }[];
}

export interface StandingsResponse {
  league: {
    standings: YahooStandings[];
  }[];
}

export interface ScoreboardResponse {
  league: {
    scoreboard: YahooScoreboard[];
  }[];
}

// =============================================================================
// APP-SPECIFIC TYPES
// =============================================================================

export interface SimplifiedLeague {
  key: string;
  id: string;
  name: string;
  logoUrl?: string;
  season: string;
  currentWeek: number;
  numTeams: number;
  scoringType: string;
  isActive: boolean;
}

export interface SimplifiedTeam {
  key: string;
  id: string;
  name: string;
  logoUrl?: string;
  isOwned: boolean;
  rank?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  leagueKey?: string; // Added for user teams endpoint
}

export interface SimplifiedPlayer {
  key: string;
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  position: string;
  eligiblePositions: string[];
  imageUrl?: string;
  status?: string;
  statusFull?: string;
  injuryNote?: string;
  selectedPosition?: string;
  percentOwned?: number;
  stats?: Record<string, number>;
}

export interface SimplifiedMatchup {
  week: number;
  status: "upcoming" | "in_progress" | "completed";
  isPlayoffs: boolean;
  myTeam: {
    key?: string;
    name: string;
    points?: number;
    projectedPoints?: number;
    stats?: Record<string, number>;
  };
  opponent: {
    key?: string;
    name: string;
    points?: number;
    projectedPoints?: number;
    stats?: Record<string, number>;
  };
  statWinners?: Record<string, "win" | "loss" | "tie">;
}

export interface WeeklyStats {
  week: number;
  stats: Record<string, number>;
  categories: {
    wins: number;
    losses: number;
    ties: number;
  };
}

export interface SeasonStats {
  stats: Record<string, number>;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
}

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

export interface SimplifiedTransaction {
  key: string;
  type: "add" | "drop" | "add/drop" | "trade" | "waiver";
  status: "successful" | "pending" | "failed";
  timestamp: number;
  players: SimplifiedTransactionPlayer[];
}

export interface SimplifiedTransactionPlayer {
  key: string;
  name: string;
  type: "add" | "drop";
  sourceTeamKey?: string;
  sourceTeamName?: string;
  destTeamKey?: string;
  destTeamName?: string;
}

// =============================================================================
// DRAFT TYPES
// =============================================================================

export interface SimplifiedDraftPick {
  pick: number;
  round: number;
  teamKey: string;
  teamName?: string;
  playerKey: string;
  playerName?: string;
}

// =============================================================================
// GAME TYPES
// =============================================================================

export interface SimplifiedGame {
  key: string;
  id: string;
  name: string;
  code: string;
  type: string;
  url: string;
  season: string;
  isRegistrationOver: boolean;
  isGameOver: boolean;
  isOffseason: boolean;
}

// =============================================================================
// ROSTER UPDATE TYPES
// =============================================================================

export interface RosterUpdate {
  date?: string;
  week?: number;
  players: RosterPositionUpdate[];
}

export interface RosterPositionUpdate {
  playerKey: string;
  position: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data?: T;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  success?: false;
  error: string;
  details?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
