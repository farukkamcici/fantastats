import type {
    SimplifiedDraftPick,
    SimplifiedLeague,
    SimplifiedMatchup,
    SimplifiedPlayer,
    SimplifiedTeam,
    SimplifiedTransaction,
    YahooGame,
    YahooLeague,
    YahooScoreboard,
    YahooStandings,
    YahooTeam,
    YahooTeamPoints,
    YahooTeamStats,
} from "@/lib/yahoo/types";

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export type ApiErrorResponse =
  | { error: string; message?: string }
  | { success: false; error: string }
  | { success: false; error: string; scoreboard: null }
  | { success: false; error: string; teams: [] };

// ---------------------------------------------------------------------------
// /api/yahoo/leagues
// ---------------------------------------------------------------------------

export type ApiLeaguesGetResponse =
  | { success: true; leagues: SimplifiedLeague[]; count: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/leagues/[leagueKey]
// ---------------------------------------------------------------------------

export type ApiLeagueGetResponse =
  | { success: true; league: YahooLeague }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/leagues/[leagueKey]/settings
// ---------------------------------------------------------------------------

export type ApiLeagueSettingsGetResponse =
  | { success: true; settings: YahooLeague["settings"] }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/leagues/[leagueKey]/teams
// ---------------------------------------------------------------------------

export type ApiLeagueTeamsGetResponse =
  | { success: true; teams: SimplifiedTeam[]; count: number }
  | { success: false; error: string; teams: []; count?: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/leagues/[leagueKey]/scoreboard
// ---------------------------------------------------------------------------

export type ApiLeagueScoreboardGetResponse =
  | { success: true; scoreboard: YahooScoreboard }
  | { success: false; error: string; scoreboard: null }
  | ApiErrorResponse;

export type ApiLeagueStandingsGetResponse =
  | { success: true; standings: YahooStandings }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/leagues/[leagueKey]/players
// ---------------------------------------------------------------------------

export type ApiLeaguePlayersGetResponse =
  | { success: true; players: SimplifiedPlayer[]; count: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/leagues/[leagueKey]/transactions
// ---------------------------------------------------------------------------

export type ApiLeagueTransactionsGetResponse =
  | { success: true; transactions: SimplifiedTransaction[]; count: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/leagues/[leagueKey]/draftresults
// ---------------------------------------------------------------------------

export type ApiLeagueDraftResultsGetResponse =
  | { success: true; draftResults: SimplifiedDraftPick[]; count: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/user/teams
// ---------------------------------------------------------------------------

export type ApiUserTeamsGetResponse =
  | { success: true; teams: SimplifiedTeam[]; count: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/team/[teamKey]
// ---------------------------------------------------------------------------

export type ApiTeamGetResponse =
  | { success: true; team: YahooTeam }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/team/[teamKey]/stats
// ---------------------------------------------------------------------------

export type ApiTeamStatsGetResponse =
  | { success: true; stats: YahooTeamStats | YahooTeamPoints | Record<string, unknown>; type: "week" | "season"; week?: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/team/[teamKey]/matchups
// ---------------------------------------------------------------------------

export type ApiTeamMatchupsGetResponse =
  | { success: true; matchups: SimplifiedMatchup[]; count: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/roster/[teamKey]
// ---------------------------------------------------------------------------

export type ApiRosterGetResponse =
  | { success: true; teamKey: string; week: number | "current"; roster: SimplifiedPlayer[]; count: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/player/[playerKey]
// ---------------------------------------------------------------------------

export type ApiPlayerGetResponse =
  | { success: true; player: SimplifiedPlayer }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/player/[playerKey]/stats
// ---------------------------------------------------------------------------

export type ApiPlayerStatsGetResponse =
  | { success: true; stats: Record<string, unknown>; type: "week" | "season"; week?: number }
  | ApiErrorResponse;

// ---------------------------------------------------------------------------
// /api/yahoo/game/[gameKey]
// ---------------------------------------------------------------------------

export type ApiGameGetResponse =
  | { success: true; game: YahooGame }
  | ApiErrorResponse;
