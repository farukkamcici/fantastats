"use client";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface FreeAgentFiltersProps {
  initialSearch?: string;
  initialPosition?: string;
  initialStatus?: string;
  initialHealthyOnly?: boolean;
  initialHasGameToday?: boolean;
  initialCompoundStats?: string[];
  statOptions?: { value: string; label: string }[];
}

export function FreeAgentFilters({
  initialSearch = "",
  initialPosition = "",
  initialStatus = "A",
  initialHealthyOnly = false,
  initialHasGameToday = false,
  initialCompoundStats = [],
  statOptions = [],
}: FreeAgentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [positionValue, setPositionValue] = useState(initialPosition || "all");
  const [statusValue, setStatusValue] = useState(initialStatus || "A");
  const [healthyValue, setHealthyValue] = useState(initialHealthyOnly);
  const [todayValue, setTodayValue] = useState(initialHasGameToday);
  const [compoundStats, setCompoundStats] = useState<string[]>(initialCompoundStats);

  useEffect(() => {
    setSearchValue(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setPositionValue(initialPosition || "all");
  }, [initialPosition]);

  useEffect(() => {
    setStatusValue(initialStatus || "A");
  }, [initialStatus]);

  useEffect(() => {
    setHealthyValue(initialHealthyOnly);
  }, [initialHealthyOnly]);

  useEffect(() => {
    setTodayValue(initialHasGameToday);
  }, [initialHasGameToday]);

  useEffect(() => {
    setCompoundStats(initialCompoundStats);
  }, [initialCompoundStats]);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.delete("start");
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("start");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    params.delete("position");
    params.delete("status");
    params.delete("healthy");
    params.delete("today");
    params.delete("compoundStats");
    params.delete("start");
    handleSearch.cancel?.();
    setSearchValue("");
    setPositionValue("all");
    setStatusValue("A");
    setHealthyValue(false);
    setTodayValue(false);
    setCompoundStats([]);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleCompoundStatsChange = (next: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (next.length > 0) {
      params.set("compoundStats", next.join(","));
    } else {
      params.delete("compoundStats");
    }
    // Back-compat cleanup
    params.delete("compoundSort");
    params.delete("compoundA");
    params.delete("compoundB");
    params.delete("compoundOrder");
    params.delete("start");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
      {/* Search */}
      <div className="relative w-full md:w-auto md:min-w-[300px]">
        <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search player by name"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleSearch(e.target.value);
          }}
          className="pl-10 bg-[var(--bg-elevated)] border-none rounded-full"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        {/* Position Filter */}
        <div className="flex items-center gap-2">
           <Select
             value={positionValue}
             onValueChange={(val) => {
               setPositionValue(val);
               handleFilterChange("position", val);
             }}
           >
             <SelectTrigger className="w-[140px] bg-[var(--bg-elevated)] border-none">
               <SelectValue placeholder="Position" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Positions</SelectItem>
               <SelectItem value="PG">PG</SelectItem>
               <SelectItem value="SG">SG</SelectItem>
               <SelectItem value="G">G</SelectItem>
               <SelectItem value="SF">SF</SelectItem>
               <SelectItem value="PF">PF</SelectItem>
               <SelectItem value="F">F</SelectItem>
               <SelectItem value="C">C</SelectItem>
               <SelectItem value="UTIL">Util</SelectItem>
             </SelectContent>
           </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Select
            value={statusValue}
            onValueChange={(val) => {
              setStatusValue(val);
              handleFilterChange("status", val);
            }}
          >
            <SelectTrigger className="w-[140px] bg-[var(--bg-elevated)] border-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">All Available</SelectItem>
              <SelectItem value="FA">Free Agents</SelectItem>
              <SelectItem value="W">Waivers</SelectItem>
              <SelectItem value="T">Taken</SelectItem>
              <SelectItem value="ALL">All Players</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Compound Score Sort */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-[190px] px-3 py-2 rounded-lg bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors text-left"
              >
                {compoundStats.length > 0 ? `Compound (${compoundStats.length})` : "Compound Score"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px] max-h-[340px] overflow-y-auto">
              <DropdownMenuCheckboxItem
                checked={compoundStats.length === 0}
                onCheckedChange={() => {
                  setCompoundStats([]);
                  handleCompoundStatsChange([]);
                }}
              >
                None
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {statOptions.map((option) => {
                const checked = compoundStats.includes(option.value);
                return (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={checked}
                    onCheckedChange={(nextChecked) => {
                      const next = nextChecked
                        ? [...compoundStats, option.value]
                        : compoundStats.filter((val) => val !== option.value);
                      const deduped = Array.from(new Set(next));
                      setCompoundStats(deduped);
                      handleCompoundStatsChange(deduped);
                    }}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Healthy Players Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={healthyValue}
            onChange={(e) => {
              setHealthyValue(e.target.checked);
              handleFilterChange("healthy", e.target.checked ? "1" : "");
            }}
            className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] focus:ring-offset-0 cursor-pointer accent-[var(--accent-primary)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Healthy</span>
        </label>

        {/* Has Game Today Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={todayValue}
            onChange={(e) => {
              setTodayValue(e.target.checked);
              handleFilterChange("today", e.target.checked ? "1" : "");
            }}
            className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] focus:ring-offset-0 cursor-pointer accent-[var(--accent-primary)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Game Today</span>
        </label>

        <button
          type="button"
          onClick={handleResetFilters}
          className="px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)] shadow-inner hover:bg-[var(--bg-subtle)] transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
