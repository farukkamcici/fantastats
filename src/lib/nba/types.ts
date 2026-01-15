export interface NbaTeam {
  id: number;
  conference: string;
  division: string;
  city: string;
  name: string;
  full_name: string;
  abbreviation: string;
}

export interface NbaGame {
  id: number;
  date: string;
  season: number;
  status: string;
  period: number;
  time: string | null;
  postseason: boolean;
  home_team_score: number;
  visitor_team_score: number;
  datetime: string | null;
  home_team: NbaTeam;
  visitor_team: NbaTeam;
}

export interface NbaGamesResponse {
  data: NbaGame[];
  meta: {
    next_cursor: number | null;
    per_page: number;
  };
}
