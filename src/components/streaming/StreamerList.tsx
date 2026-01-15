"use client";

import type { StreamingSuggestion } from "@/lib/analysis/streaming";
import { StreamerCard } from "./StreamerCard";

export function StreamerList({ suggestions }: { suggestions: StreamingSuggestion[] }) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-center text-sm text-[var(--text-tertiary)]">
        No streaming suggestions available.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((suggestion) => (
        <StreamerCard key={suggestion.player.key} suggestion={suggestion} />
      ))}
    </div>
  );
}
