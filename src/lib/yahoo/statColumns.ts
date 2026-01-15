import type { YahooStatCategoryEntry } from "@/lib/yahoo/types";

export type StatColumn = {
  key: string;
  label: string;
  statId?: number;
};

export function buildStatColumns(categories: YahooStatCategoryEntry[]): StatColumn[] {
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
