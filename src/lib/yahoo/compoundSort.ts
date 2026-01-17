export type CompoundSortKey = "stocks" | "fgFtPct" | "ftPct3ptm";

export type CompoundSortOrder = "asc" | "desc";

export type CompoundSortDefinition = {
  key: CompoundSortKey;
  label: string;
  description: string;
  statIds: [number, number];
  order: CompoundSortOrder;
};

export const COMPOUND_SORT_DEFINITIONS: readonly CompoundSortDefinition[] = [
  {
    key: "stocks",
    label: "ST + BLK (Stocks)",
    description: "Sort by Steals + Blocks",
    statIds: [17, 18],
    order: "desc",
  },
  {
    key: "fgFtPct",
    label: "FG% + FT%",
    description: "Sort by Field Goal % + Free Throw %",
    statIds: [5, 8],
    order: "desc",
  },
  {
    key: "ftPct3ptm",
    label: "FT% + 3PTM",
    description: "Sort by Free Throw % + 3-Pointers Made",
    statIds: [8, 10],
    order: "desc",
  },
] as const;

export function getCompoundSortDefinition(
  key: string | null | undefined
): CompoundSortDefinition | undefined {
  if (!key) return undefined;
  return COMPOUND_SORT_DEFINITIONS.find((definition) => definition.key === key);
}

export type CompoundSortConfig = {
  statIds: [number, number];
  order: CompoundSortOrder;
};
