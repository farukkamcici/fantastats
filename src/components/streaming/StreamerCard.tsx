"use client";

import type { StreamingSuggestion } from "@/lib/analysis/streaming";

export function StreamerCard({ suggestion }: { suggestion: StreamingSuggestion }) {
  const { player, gamesThisWeek } = suggestion;
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{player.name}</p>
      <p className="text-xs text-[var(--text-tertiary)]">
        {player.teamAbbr} · {player.position}
      </p>
      <div className="mt-2 text-xs text-[var(--text-secondary)]">
        {gamesThisWeek} games this week
      </div>
    </div>
  );
}
