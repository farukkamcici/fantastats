/**
 * Yahoo NBA Fantasy Stat ID Mapping
 * 
 * This file provides a comprehensive mapping between Yahoo Fantasy Sports API
 * stat IDs and their corresponding names for NBA players.
 * 
 * Reference: Yahoo Fantasy Sports API player stats response
 * Example: /fantasy/v2/player/{player_key}/stats;type=season
 */

export interface StatDefinition {
  id: number;
  name: string;
  abbr: string;
  description: string;
  sortOrder: 'asc' | 'desc'; // 'desc' = higher is better, 'asc' = lower is better (e.g., TO)
  format?: 'integer' | 'decimal' | 'percentage';
}

/**
 * Standard NBA stat IDs from Yahoo Fantasy Sports API
 */
export const NBA_STAT_MAPPING: Record<number, StatDefinition> = {
  // Game Info
  0: { id: 0, name: 'Games Played', abbr: 'GP', description: 'Oynanan maç sayısı', sortOrder: 'desc', format: 'integer' },
  1: { id: 1, name: 'Games Started', abbr: 'GS', description: 'Başlanan maç sayısı', sortOrder: 'desc', format: 'integer' },
  2: { id: 2, name: 'Minutes Played', abbr: 'MIN', description: 'Oynanan dakika (toplam)', sortOrder: 'desc', format: 'integer' },
  
  // Field Goals
  3: { id: 3, name: 'Field Goals Attempted', abbr: 'FGA', description: 'Atılan şut sayısı', sortOrder: 'desc', format: 'integer' },
  4: { id: 4, name: 'Field Goals Made', abbr: 'FGM', description: 'Giren şut sayısı', sortOrder: 'desc', format: 'integer' },
  5: { id: 5, name: 'Field Goal Percentage', abbr: 'FG%', description: 'Şut yüzdesi', sortOrder: 'desc', format: 'percentage' },
  
  // Free Throws
  6: { id: 6, name: 'Free Throws Attempted', abbr: 'FTA', description: 'Serbest atış sayısı', sortOrder: 'desc', format: 'integer' },
  7: { id: 7, name: 'Free Throws Made', abbr: 'FTM', description: 'Giren serbest atış', sortOrder: 'desc', format: 'integer' },
  8: { id: 8, name: 'Free Throw Percentage', abbr: 'FT%', description: 'Serbest atış yüzdesi', sortOrder: 'desc', format: 'percentage' },
  
  // 3-Pointers
  9: { id: 9, name: '3-Pointers Attempted', abbr: '3PTA', description: 'Üçlük atış sayısı', sortOrder: 'desc', format: 'integer' },
  10: { id: 10, name: '3-Pointers Made', abbr: '3PTM', description: 'Giren üçlük sayısı', sortOrder: 'desc', format: 'integer' },
  11: { id: 11, name: '3-Point Percentage', abbr: '3PT%', description: 'Üçlük yüzdesi', sortOrder: 'desc', format: 'percentage' },
  
  // Scoring
  12: { id: 12, name: 'Points Scored', abbr: 'PTS', description: 'Sayı', sortOrder: 'desc', format: 'integer' },
  
  // Rebounds
  13: { id: 13, name: 'Offensive Rebounds', abbr: 'OREB', description: 'Hücum ribaundu', sortOrder: 'desc', format: 'integer' },
  14: { id: 14, name: 'Defensive Rebounds', abbr: 'DREB', description: 'Savunma ribaundu', sortOrder: 'desc', format: 'integer' },
  15: { id: 15, name: 'Total Rebounds', abbr: 'REB', description: 'Toplam ribaund', sortOrder: 'desc', format: 'integer' },
  
  // Playmaking & Defense
  16: { id: 16, name: 'Assists', abbr: 'AST', description: 'Asist', sortOrder: 'desc', format: 'integer' },
  17: { id: 17, name: 'Steals', abbr: 'ST', description: 'Top çalma', sortOrder: 'desc', format: 'integer' },
  18: { id: 18, name: 'Blocked Shots', abbr: 'BLK', description: 'Blok', sortOrder: 'desc', format: 'integer' },
  19: { id: 19, name: 'Turnovers', abbr: 'TO', description: 'Top kaybı', sortOrder: 'asc', format: 'integer' }, // Lower is better
  
  // Efficiency
  20: { id: 20, name: 'Assist/Turnover Ratio', abbr: 'A/TO', description: 'Asist/Top kaybı oranı', sortOrder: 'desc', format: 'decimal' },
  
  // Fouls
  21: { id: 21, name: 'Personal Fouls', abbr: 'PF', description: 'Kişisel faul', sortOrder: 'asc', format: 'integer' }, // Lower is better
  22: { id: 22, name: 'Disqualifications', abbr: 'DQ', description: 'Diskalifiye', sortOrder: 'asc', format: 'integer' },
  23: { id: 23, name: 'Technical Fouls', abbr: 'TECH', description: 'Teknik faul', sortOrder: 'asc', format: 'integer' },
  24: { id: 24, name: 'Ejections', abbr: 'EJCT', description: 'İhraç', sortOrder: 'asc', format: 'integer' },
  25: { id: 25, name: 'Flagrant Fouls', abbr: 'FF', description: 'Sert faul', sortOrder: 'asc', format: 'integer' },
  
  // Special
  27: { id: 27, name: 'Double-Doubles', abbr: 'DD', description: 'Çift-çift', sortOrder: 'desc', format: 'integer' },
  28: { id: 28, name: 'Triple-Doubles', abbr: 'TD', description: 'Üçlü-çift', sortOrder: 'desc', format: 'integer' },
};

/**
 * Compound stat IDs used by Yahoo for display purposes
 * These combine two individual stats into one column
 */
export const COMPOUND_STAT_MAPPING: Record<number, { firstStatId: number; secondStatId: number; label: string }> = {
  9004003: { firstStatId: 4, secondStatId: 3, label: 'FGM/FGA' }, // FGM / FGA
  9007006: { firstStatId: 7, secondStatId: 6, label: 'FTM/FTA' }, // FTM / FTA
};

/**
 * Get stat definition by ID
 */
export function getStatDefinition(statId: number): StatDefinition | undefined {
  return NBA_STAT_MAPPING[statId];
}

/**
 * Get stat abbreviation by ID
 */
export function getStatAbbr(statId: number): string {
  return NBA_STAT_MAPPING[statId]?.abbr || `stat_${statId}`;
}

/**
 * Get stat name by ID
 */
export function getStatName(statId: number): string {
  return NBA_STAT_MAPPING[statId]?.name || `Stat ${statId}`;
}

/**
 * Check if a stat ID is a compound stat
 */
export function isCompoundStat(statId: number): boolean {
  return statId > 9000000 && statId in COMPOUND_STAT_MAPPING;
}

/**
 * Get compound stat parts
 */
export function getCompoundStatParts(statId: number): { firstStatId: number; secondStatId: number; label: string } | undefined {
  return COMPOUND_STAT_MAPPING[statId];
}

/**
 * Parse stat value from Yahoo API response
 */
export function parseStatValue(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '' || value === '-') {
    return null;
  }
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Format stat value for display
 */
export function formatStatValue(value: number | string | null | undefined, format?: 'integer' | 'decimal' | 'percentage'): string {
  if (value === null || value === undefined || value === '' || value === '-') {
    return '-';
  }
  
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);
  
  switch (format) {
    case 'percentage':
      // Yahoo returns percentages as decimals like 0.465 for 46.5%
      return num < 1 ? num.toFixed(3) : num.toFixed(1);
    case 'decimal':
      return num.toFixed(2);
    case 'integer':
    default:
      return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  }
}
