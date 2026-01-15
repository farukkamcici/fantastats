"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekSelectorProps {
  currentWeek: number;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  maxWeek?: number;
}

export function WeekSelector({ 
  currentWeek, 
  selectedWeek, 
  onWeekChange,
  maxWeek 
}: WeekSelectorProps) {
  const effectiveMaxWeek = maxWeek ?? currentWeek;

  const handlePrevious = () => {
    if (selectedWeek > 1) {
      onWeekChange(selectedWeek - 1);
    }
  };

  const handleNext = () => {
    if (selectedWeek < effectiveMaxWeek) {
      onWeekChange(selectedWeek + 1);
    }
  };

  const isCurrent = selectedWeek === currentWeek;

  return (
    <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-sm">
      <button
        onClick={handlePrevious}
        disabled={selectedWeek <= 1}
        className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous week"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="px-2 min-w-[100px] flex flex-col items-center justify-center">
        <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
          Week {selectedWeek}
        </span>
        {isCurrent && (
          <span className="text-[10px] font-medium text-[var(--accent)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Current
          </span>
        )}
      </div>
      
      <button
        onClick={handleNext}
        disabled={selectedWeek >= effectiveMaxWeek}
        className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next week"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
