import { NBA_STAT_MAPPING } from "@/lib/yahoo/statMapping";
import type { YahooStatCategoryEntry } from "@/lib/yahoo/types";

export type StatColumn = {
  key: string;
  label: string;
  statId?: number;
};

export function buildStatColumns(categories: YahooStatCategoryEntry[]): StatColumn[] {
  // Start with enabled stats from settings - purely based on what is enabled
  return categories
    .filter((entry) => {
      const enabled = entry.stat.enabled;
      return enabled === 1 || enabled === "1" || enabled === true;
    })
    .map((entry) => {
      const stat = entry.stat;
      const label = stat.abbr || stat.display_name || stat.name;
      return {
        key: `stat_${stat.stat_id}`,
        label,
        statId: Number(stat.stat_id),
      };
    });
}

/**
 * Injects individual FGM/FGA/FTM/FTA columns if they are missing.
 * Intended for the Free Agents table.
 */
export function injectIndividualStats(columns: StatColumn[]): StatColumn[] {
  const newColumns = [...columns];
  const existingIds = new Set(newColumns.map((c) => c.statId));
  const missingIds: number[] = [];

  // If FGM (4) or FGA (3) likely wanted (if FG% (5) exists or just generally for NBA)
  if (!existingIds.has(3)) missingIds.push(3);
  if (!existingIds.has(4)) missingIds.push(4);

  // If FTM (7) or FTA (6) likely wanted (if FT% (8) exists)
  if (!existingIds.has(6)) missingIds.push(6);
  if (!existingIds.has(7)) missingIds.push(7);

  // Inject using definitions
  missingIds.forEach((id) => {
    const def = NBA_STAT_MAPPING[id];
    if (def) {
      newColumns.push({
        key: `stat_${id}`,
        label: def.abbr,
        statId: id,
      });
    }
  });

  // Sort by statId for consistent order
  return newColumns.sort((a, b) => (a.statId || 0) - (b.statId || 0));
}

/**
 * Injects compound FGM/FGA (9004003) and FTM/FTA (9007006) stats.
 * Intended for Roster tables where we want merged columns.
 * Also REMOVES the individual stats (3,4,6,7) to avoid duplication if the table handles compounds.
 */
export function injectCompoundStats(columns: StatColumn[]): StatColumn[] {
  // Filter out individual 3,4,6,7 first, as we want to replace them with compounds
  // (Or we can keep them if the user wants both, but user said "do not create individual ones" for roster)
  let newColumns = columns.filter(c => ![3, 4, 6, 7].includes(c.statId || -1));

  // Determine if we should add compounds based on presence of % stats or generic NBA context
  // But safer is just to force them for NBA legaues.
  
  // Add FGM/FGA (9004003)
  newColumns.push({
    key: `stat_9004003`,
    label: "FGM/FGA",
    statId: 9004003
  });

  // Add FTM/FTA (9007006)
  newColumns.push({
    key: `stat_9007006`,
    label: "FTM/FTA",
    statId: 9007006
  });

  // Sort by statId. 
  // Note: 9xxxxxx IDs will be at the end, which is usually fine, or we can interleave.
  // Ideally, FGM/FGA comes before FG% (5).
  // We can hack the sort order or just append. 
  // Let's sort, but map 9004003 to effectively 4.5 and 9007006 to 7.5 for sorting purposes?
  // Or just strict ID sort puts them at end. User might prefer them near %.
  
  return newColumns.sort((a, b) => {
    const getSortId = (id?: number) => {
        if (!id) return 9999999;
        if (id === 9004003) return 4.5; // Place between FGM(4) and FG%(5)
        if (id === 9007006) return 7.5; // Place between FTM(7) and FT%(8)
        return id;
    };
    return getSortId(a.statId) - getSortId(b.statId);
  });
}
