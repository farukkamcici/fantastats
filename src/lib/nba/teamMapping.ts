const YAHOO_TO_BALLDONTLIE: Record<string, number> = {
  ATL: 1,
  BOS: 2,
  BKN: 3,
  CHA: 4,
  CHI: 5,
  CLE: 6,
  DAL: 7,
  DEN: 8,
  DET: 9,
  GSW: 10,
  HOU: 11,
  IND: 12,
  LAC: 13,
  LAL: 14,
  MEM: 15,
  MIA: 16,
  MIL: 17,
  MIN: 18,
  NOP: 19,
  NYK: 20,
  OKC: 21,
  ORL: 22,
  PHI: 23,
  PHX: 24,
  POR: 25,
  SAC: 26,
  SAS: 27,
  TOR: 28,
  UTA: 29,
  WAS: 30,
  NO: 19,
  NY: 20,
  GS: 10,
  SA: 27,
  PHO: 24,
};

export function normalizeYahooAbbr(abbr: string): string {
  const upper = abbr.toUpperCase();
  if (upper === "NO") return "NOP";
  if (upper === "NY") return "NYK";
  if (upper === "GS") return "GSW";
  if (upper === "SA") return "SAS";
  if (upper === "PHO") return "PHX";
  return upper;
}

export function getBalldontlieTeamId(yahooAbbr: string): number | undefined {
  const normalized = normalizeYahooAbbr(yahooAbbr);
  return YAHOO_TO_BALLDONTLIE[normalized];
}

export function getTeamMapping(): Record<string, number> {
  return { ...YAHOO_TO_BALLDONTLIE };
}
