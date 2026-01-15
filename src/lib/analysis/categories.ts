export interface CategoryNeed {
  statId: string;
  weight: number;
}

export function defaultCategoryNeeds(): CategoryNeed[] {
  return [
    { statId: "points", weight: 1 },
    { statId: "rebounds", weight: 1 },
    { statId: "assists", weight: 1 },
  ];
}
