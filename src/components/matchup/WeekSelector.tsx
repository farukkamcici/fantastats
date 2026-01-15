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

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrevious}
        disabled={selectedWeek <= 1}
        className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous week"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="px-4 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] min-w-[100px] text-center">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Week {selectedWeek}
        </span>
        {selectedWeek === currentWeek && (
          <span className="ml-2 text-xs text-[var(--accent)]">(Current)</span>
        )}
      </div>
      
      <button
        onClick={handleNext}
        disabled={selectedWeek >= effectiveMaxWeek}
        className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next week"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
