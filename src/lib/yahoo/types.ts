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

export type YahooNumber = number | string;
export type YahooBoolean = 0 | 1 | "0" | "1" | boolean;
export type YahooList<T> = Record<string, T> & { count?: YahooNumber };

// =============================================================================
// USER & GAMES
// =============================================================================

export interface YahooUser {
  guid: string;
  games?: YahooList<YahooGameEntry>;
}

export interface YahooGame {
  game_key: string;
  game_id: string;
  name: string;
  code: string; // 'nba', 'nfl', etc.
  type: string;
  url: string;
  season: string;
  is_registration_over: YahooBoolean;
  is_game_over: YahooBoolean;
  is_offseason: YahooBoolean;
  leagues?: YahooList<YahooLeagueEntry>;
}

export interface YahooGameEntry {
  game: YahooGameData;
}

export type YahooGameData = [YahooGame, YahooGameExtras?];

export interface YahooGameExtras {
  leagues?: YahooList<YahooLeagueEntry>;
  teams?: YahooList<YahooTeamEntry>;
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
  allow_add_to_dl_extra_pos: YahooBoolean;
  is_pro_league: YahooBoolean;
  is_cash_league: YahooBoolean;
  current_week: number;
  start_week: string;
  start_date: string;
  end_week: string;
  end_date: string;
  is_finished?: YahooBoolean;
  password?: string;
  roster_type?: string;
  felo_tier?: string;
  is_highscore?: YahooBoolean;
  matchup_week?: YahooNumber;
  short_invitation_url?: string;
  current_date?: string;
  is_plus_league?: YahooBoolean;
  game_code: string;
  season: string;
  settings?: YahooLeagueSettings;
  standings?: YahooStandings;
  scoreboard?: YahooScoreboard;
  teams?: YahooTeam[];
}

export interface YahooLeagueSettings {
  draft_type: string;
  is_auction_draft: YahooBoolean;
  scoring_type: string;
  persistent_url?: string;
  is_highscore?: YahooBoolean;
  invite_permission?: string;
  uses_playoff: YahooBoolean;
  has_playoff_consolation_games: YahooBoolean;
  playoff_start_week: YahooNumber;
  uses_playoff_reseeding: YahooBoolean;
  uses_lock_eliminated_teams: YahooBoolean;
  num_playoff_teams: YahooNumber;
  num_playoff_consolation_teams: YahooNumber;
  has_multiweek_championship: YahooBoolean;
  waiver_type: string;
  waiver_rule: string;
  uses_faab: YahooBoolean;
  draft_time?: string;
  draft_pick_time?: string;
  post_draft_players: string;
  max_teams: YahooNumber;
  waiver_time?: string;
  trade_end_date?: string;
  trade_ratify_type: string;
  trade_reject_time?: string;
  player_pool: string;
  cant_cut_list: string;
  draft_together?: string;
  sendbird_channel_url?: string;
  is_publicly_viewable?: YahooBoolean;
  roster_positions: YahooRosterPositionEntry[];
  stat_categories: YahooStatCategoryCollection;
  stat_modifiers?: YahooStatModifierEntry[];
  max_weekly_adds?: YahooNumber;
  uses_median_score?: YahooBoolean;
  league_premium_features?: string[];
}

export interface YahooRosterPosition {
  position: string;
  position_type?: string;
  count: YahooNumber;
  is_starting_position?: YahooBoolean;
}

export interface YahooRosterPositionEntry {
  roster_position: YahooRosterPosition;
}

export interface YahooStatCategory {
  stat_id: YahooNumber;
  enabled: YahooBoolean;
  name: string;
  display_name: string;
  sort_order: string; // '0' = lower is better, '1' = higher is better
  group?: string;
  abbr?: string;
  position_type: string;
  stat_position_types?: YahooStatPositionTypeEntry[];
  is_only_display_stat?: YahooBoolean;
}

export interface YahooStatPositionType {
  position_type: string;
}

export interface YahooStatPositionTypeEntry {
  stat_position_type: YahooStatPositionType;
}

export interface YahooStatCategoryEntry {
  stat: YahooStatCategory;
}

export interface YahooStatCategoryCollection {
  stats: YahooStatCategoryEntry[];
}

export interface YahooStatModifier {
  stat_id: YahooNumber;
  value: YahooNumber;
}

export interface YahooStatModifierEntry {
  stat_modifier: YahooStatModifier;
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
    rank: YahooNumber;
    playoff_seed?: YahooNumber;
    outcome_totals: {
      wins: YahooNumber;
      losses: YahooNumber;
      ties: YahooNumber;
      percentage: string;
    };
    streak?: {
      type: string;
      value: YahooNumber;
    };
    points_for?: YahooNumber;
    points_against?: YahooNumber;
    games_back?: string;
  };
  team_stats?: Record<string, number | string>;
  manager?: {
    nickname?: string;
    image_url?: string;
    felo_score?: string;
    felo_tier?: string;
  };
}

// =============================================================================
// TEAM
// =============================================================================

export interface YahooTeam {
  team_key: string;
  team_id: string;
  name: string;
  is_owned_by_current_login: YahooBoolean | boolean;
  url: string;
  team_logos?: { team_logo: { size: string; url: string } }[];
  waiver_priority?: YahooNumber;
  faab_balance?: YahooNumber;
  number_of_moves?: YahooNumber;
  number_of_trades?: YahooNumber;
  roster_adds?: {
    coverage_type: string;
    coverage_value: YahooNumber;
    value: YahooNumber;
  };
  league_scoring_type?: string;
  has_draft_grade?: YahooBoolean;
  auction_budget_total?: YahooNumber;
  auction_budget_spent?: YahooNumber;
  managers?: YahooManager[];
  roster?: YahooRoster;
  team_stats?: YahooTeamStats;
  team_points?: YahooTeamPoints;
  team_remaining_games?: YahooTeamRemainingGames;
  team_projected_points?: YahooTeamPoints;
  win_probability?: YahooNumber;
  matchups?: YahooMatchup[];
}

export interface YahooManager {
  manager_id: string;
  nickname: string;
  guid: string;
  is_commissioner?: YahooBoolean;
  is_current_login?: YahooBoolean;
  email?: string;
  image_url?: string;
  felo_score?: YahooNumber;
  felo_tier?: string;
}

// =============================================================================
// ROSTER
// =============================================================================

export interface YahooRoster {
  coverage_type: string;
  week?: YahooNumber;
  date?: string;
  is_prescoring?: YahooBoolean;
  is_editable?: YahooBoolean;
  players?: YahooList<YahooPlayerEntry>;
  "0"?: YahooRosterPlayersContainer;
}

export interface YahooRosterPlayersContainer {
  players: YahooList<YahooPlayerEntry>;
}

export interface YahooPlayer {
  player_key: string;
  player_id?: string;
  name?: YahooPlayerName;
  url?: string;
  editorial_player_key?: string;
  editorial_team_key?: string;
  editorial_team_full_name?: string;
  editorial_team_abbr?: string; // e.g., "LAL", "GSW"
  editorial_team_url?: string;
  bye_weeks?: YahooByeWeeks;
  uniform_number?: string;
  display_position?: string;
  headshot?: {
    url: string;
    size: string;
  };
  image_url?: string;
  is_undroppable?: YahooBoolean;
  position_type?: string;
  primary_position?: string;
  eligible_positions?: YahooEligiblePositions;
  has_player_notes?: YahooBoolean;
  player_notes_last_timestamp?: YahooNumber;
  selected_position?: YahooSelectedPosition[];
  starting_status?: YahooPlayerStartingStatus;
  transaction_data?: YahooTransactionData;
  percent_owned?: YahooPercentOwned;
  ownership?: YahooOwnership;
  draft_analysis?: YahooDraftAnalysis;
  player_stats?: YahooPlayerStats;
  player_points?: YahooPlayerPoints;
  player_advanced_stats?: YahooPlayerAdvancedStats;
  status?: string; // 'IR', 'O', 'GTD', 'INJ', etc.
  status_full?: string;
  injury_note?: string;
  on_disabled_list?: YahooBoolean;
}

export interface YahooPlayerName {
  full: string;
  first?: string;
  last?: string;
  ascii_first?: string;
  ascii_last?: string;
}

export interface YahooEligiblePosition {
  position: string;
}

export type YahooEligiblePositions = YahooEligiblePosition[];

export interface YahooByeWeek {
  week: string;
}

export type YahooByeWeeks = YahooByeWeek[];

export interface YahooSelectedPosition {
  coverage_type?: string;
  week?: YahooNumber;
  date?: string;
  position?: string;
  is_flex?: YahooBoolean;
}

export interface YahooPlayerEntry {
  player: YahooPlayerData;
}

export type YahooPlayerData = [
  YahooPlayerMetaArray,
  YahooPlayerSelectedPositionEntry?,
  YahooPlayerTransactionDataEntry?,
  YahooPlayerPercentOwnedEntry?,
  YahooPlayerOwnershipEntry?,
  YahooPlayerDraftAnalysisEntry?,
  YahooPlayerNotesEntry?,
  YahooPlayerStatsEntry?,
  YahooPlayerPointsEntry?,
  YahooPlayerAdvancedStatsEntry?,
  YahooPlayerStartingStatusEntry?,
  YahooPlayerInjuryEntry?
];

export type YahooPlayerMetaArray = YahooPlayerMetaField[];

export type YahooPlayerMetaField = Partial<YahooPlayer>;

export interface YahooPlayerSelectedPositionEntry {
  selected_position: YahooSelectedPosition[];
}

export interface YahooPlayerTransactionDataEntry {
  transaction_data: YahooTransactionData;
}

export interface YahooPlayerPercentOwnedEntry {
  percent_owned: YahooPercentOwned;
}

export interface YahooPlayerOwnershipEntry {
  ownership: YahooOwnership;
}

export interface YahooPlayerDraftAnalysisEntry {
  draft_analysis: YahooDraftAnalysis;
}

export interface YahooPlayerNotesEntry {
  has_player_notes?: YahooBoolean;
  player_notes_last_timestamp?: YahooNumber;
}

export interface YahooPlayerStatsEntry {
  player_stats: YahooPlayerStats;
}

export interface YahooPlayerPointsEntry {
  player_points: YahooPlayerPoints;
}

export interface YahooPlayerAdvancedStatsEntry {
  player_advanced_stats: YahooPlayerAdvancedStats;
}

export interface YahooPlayerStartingStatusEntry {
  starting_status: YahooPlayerStartingStatus;
}

export interface YahooPlayerInjuryEntry {
  status?: string;
  status_full?: string;
  injury_note?: string;
  on_disabled_list?: YahooBoolean;
}

export interface YahooTransactionData {
  type: string;
  source_type: string;
  source_team_key?: string;
  source_team_name?: string;
  destination_type: string;
  destination_team_key?: string;
  destination_team_name?: string;
}

export interface YahooPercentOwned {
  coverage_type: string;
  week?: YahooNumber;
  value: YahooNumber;
  delta?: YahooNumber;
}

export interface YahooOwnership {
  ownership_type: string;
  owner_team_key?: string;
  owner_team_name?: string;
}

export interface YahooDraftAnalysis {
  average_pick: string;
  average_round: string;
  average_cost: string;
  percent_drafted: string;
}

export interface YahooPlayerStartingStatus {
  coverage_type: string;
  week?: YahooNumber;
  date?: string;
  is_starting: YahooBoolean;
}

// =============================================================================
// STATS
// =============================================================================

export interface YahooPlayerStats {
  coverage_type?: string;
  season?: string;
  date?: string;
  week?: YahooNumber;
  "0"?: YahooStatContext;
  stats?: YahooStatEntry[];
}

export interface YahooStat {
  stat_id: YahooNumber;
  value: string;
}

export interface YahooStatEntry {
  stat: YahooStat;
}

export interface YahooStatContext {
  coverage_type: string;
  season?: string;
  week?: YahooNumber;
  date?: string;
}

export interface YahooPlayerPoints {
  coverage_type?: string;
  season?: string;
  week?: YahooNumber;
  "0"?: YahooStatContext;
  total?: string;
}

export interface YahooPlayerAdvancedStats {
  coverage_type?: string;
  season?: string;
  "0"?: YahooStatContext;
  stats?: YahooStatEntry[];
}

export interface YahooTeamStats {
  coverage_type?: string;
  season?: string;
  week?: YahooNumber;
  "0"?: YahooStatContext;
  stats?: YahooStatEntry[];
}

export interface YahooTeamPoints {
  coverage_type?: string;
  season?: string;
  week?: YahooNumber;
  "0"?: YahooStatContext;
  total?: string;
}

export interface YahooTeamRemainingGames {
  coverage_type?: string;
  week?: YahooNumber;
  total?: {
    remaining_games?: YahooNumber;
    live_games?: YahooNumber;
    completed_games?: YahooNumber;
  };
}

// =============================================================================
// RAW RESPONSE STRUCTURES
// =============================================================================

export type YahooTeamMetaArray = Array<Partial<YahooTeam>>;

export interface YahooTeamRosterEntry {
  roster: YahooRoster;
}

export interface YahooTeamStatsEntry {
  team_stats?: YahooTeamStats;
  team_points?: YahooTeamPoints;
  team_remaining_games?: YahooTeamRemainingGames;
  team_projected_points?: YahooTeamPoints;
  win_probability?: YahooNumber;
}

export interface YahooTeamStandingsEntry {
  team_standings: YahooTeamStanding["team_standings"];
}

export type YahooTeamData =
  | [YahooTeamMetaArray, YahooTeamRosterEntry?]
  | [YahooTeamMetaArray, YahooTeamStatsEntry?, YahooTeamStandingsEntry?];

export interface YahooTeamEntry {
  team: YahooTeamData;
}

export interface YahooMatchupTeamEntry {
  team: YahooMatchupTeamData;
}

export type YahooMatchupTeamData = [YahooTeamMetaArray, YahooTeamStatsEntry?];

export interface YahooStatWinnerEntry {
  stat_winner: YahooStatWinner;
}

export interface YahooMatchupRaw {
  "0"?: { teams: YahooList<YahooMatchupTeamEntry> };
  week?: YahooNumber;
  week_start?: string;
  week_end?: string;
  status?: string;
  is_playoffs?: YahooBoolean;
  is_consolation?: YahooBoolean;
  is_matchup_of_the_week?: YahooBoolean;
  is_tied?: YahooBoolean | number;
  winner_team_key?: string;
  stat_winners?: YahooStatWinnerEntry[];
}

export interface YahooMatchupEntry {
  matchup: YahooMatchupRaw;
}

export interface YahooScoreboardRaw {
  week?: YahooNumber;
  "0"?: { matchups: YahooList<YahooMatchupEntry> };
}

export interface YahooStandingsRaw {
  "0"?: { teams: YahooList<YahooTeamEntry> };
  teams?: YahooList<YahooTeamEntry>;
}

export interface YahooLeagueExtras {
  settings?: YahooLeagueSettings[];
  standings?: YahooStandingsRaw;
  scoreboard?: YahooScoreboardRaw;
  teams?: YahooList<YahooTeamEntry>;
  transactions?: YahooList<YahooTransactionEntry>;
  draft_results?: YahooList<YahooDraftResultEntry>;
  players?: YahooList<YahooPlayerEntry>;
}

export type YahooLeagueData = [YahooLeague, YahooLeagueExtras?];

export interface YahooLeagueEntry {
  league: YahooLeagueData;
}

export interface YahooTransactionMeta {
  transaction_key: string;
  transaction_id: string;
  type: string;
  status: string;
  timestamp: YahooNumber;
}

export interface YahooTransactionPlayersEntry {
  players: YahooList<YahooTransactionPlayerEntry>;
}

export interface YahooTransactionPlayerEntry {
  player: YahooPlayerData;
}

export type YahooTransactionDataArray = [
  YahooTransactionMeta,
  YahooTransactionPlayersEntry?
];

export interface YahooTransactionEntry {
  transaction: YahooTransactionDataArray;
}

export interface YahooDraftResultEntry {
  draft_result: YahooDraftResult;
}

// =============================================================================
// MATCHUP
// =============================================================================

export interface YahooScoreboard {
  week: YahooNumber;
  matchups: YahooMatchup[];
}

export interface YahooMatchup {
  week: YahooNumber;
  week_start: string;
  week_end: string;
  status: string; // 'postevent', 'midevent', 'preevent'
  is_playoffs: YahooBoolean | boolean;
  is_consolation: YahooBoolean | boolean;
  is_tied?: YahooBoolean | boolean;
  winner_team_key?: string;
  teams: YahooMatchupTeam[];
  stat_winners?: YahooStatWinner[];
}

export interface YahooMatchupTeam {
  team: YahooTeam;
  team_points?: YahooTeamPoints;
  team_stats?: YahooTeamStats;
  team_projected_points?: YahooTeamPoints;
  team_remaining_games?: YahooTeamRemainingGames;
  win_probability?: YahooNumber;
}

export interface YahooStatWinner {
  stat_id: YahooNumber;
  winner_team_key: string;
  is_tied?: YahooBoolean | boolean;
}

// =============================================================================
// TRANSACTIONS
// =============================================================================

export interface YahooTransaction {
  transaction_key: string;
  transaction_id: string;
  type: string; // 'add', 'drop', 'add/drop', 'trade'
  status: string;
  timestamp: YahooNumber;
  players?: YahooList<YahooTransactionPlayerEntry>;
}

export interface YahooTransactionPlayer {
  player: YahooPlayerData;
}

// =============================================================================
// DRAFT
// =============================================================================

export interface YahooDraftResult {
  pick: number;
  round: number;
  cost?: YahooNumber;
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

export interface YahooUserMeta {
  guid: string;
}

export interface YahooUserGames {
  games: YahooList<YahooGameEntry>;
}

export type YahooUserData = [YahooUserMeta, YahooUserGames];

export interface LeaguesResponse {
  users: YahooList<{ user: YahooUserData }>;
}

export interface LeagueResponse {
  league: YahooLeagueData;
}

export interface TeamResponse {
  team: YahooTeamData;
}

export interface RosterResponse {
  team: [YahooTeamMetaArray, YahooTeamRosterEntry?];
}

export interface PlayersResponse {
  league: [YahooLeague, { players: YahooList<YahooPlayerEntry> }];
}

export interface MatchupResponse {
  team: [
    YahooTeamMetaArray,
    { matchups: YahooList<YahooMatchupEntry> }
  ];
}

export interface StandingsResponse {
  league: [YahooLeague, { standings: YahooStandingsRaw }];
}

export interface ScoreboardResponse {
  league: [YahooLeague, { scoreboard: YahooScoreboardRaw }];
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
  managers?: { nickname: string; imageUrl?: string }[];
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
  stats?: Record<string, number | string>;
}

export interface SimplifiedMatchup {
  week: number;
  weekStart?: string;
  weekEnd?: string;
  status: "upcoming" | "in_progress" | "completed";
  isPlayoffs: boolean;
  winnerTeamKey?: string;
  myTeam: SimplifiedMatchupTeam;
  opponent: SimplifiedMatchupTeam;
  statWinners?: Record<string, "win" | "loss" | "tie">;
}

export interface SimplifiedMatchupTeam {
  key?: string;
  name: string;
  logoUrl?: string;
  points?: number;
  projectedPoints?: number;
  stats?: Record<string, number | string>;
  remainingGames?: {
    remaining: number;
    live: number;
    completed: number;
  };
  rosterAdds?: {
    used: number;
    total: number;
  };
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
