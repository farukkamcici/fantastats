"use client";

import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLeague } from "@/contexts";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowRightLeft,
    Calendar,
    ChevronDown,
    Swords,
    Trophy,
    UserPlus,
    Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavTab {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SimplifiedLeague {
  key: string;
  id: string;
  name: string;
  logoUrl?: string;
  season: string;
  currentWeek: number;
  numTeams: number;
  scoringType: string;
  isActive: boolean;
}

/**
 * Dashboard Header with Tab Navigation
 * - Shows tabs when inside a league context
 * - Clean dashboard-style navigation
 */
export function DashboardHeader() {
  const { currentLeague, setCurrentLeague } = useLeague();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch leagues for the dropdown
  const { data: leagues } = useQuery<SimplifiedLeague[]>({
    queryKey: ["leagues"],
    queryFn: async () => {
      const res = await fetch("/api/yahoo/leagues");
      if (!res.ok) return [];
      const data = await res.json();
      return data.leagues || [];
    },
  });

  const activeLeagues = leagues?.filter(l => l.isActive) || [];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLeagueSelect = (league: SimplifiedLeague) => {
    setCurrentLeague({ key: league.key, name: league.name });
    setDropdownOpen(false);
    router.push(`/dashboard/${league.key}/matchups`);
  };

  // Tabs shown when inside a league
  const leagueTabs: NavTab[] = currentLeague ? [
    { 
      label: "My Team", 
      href: `/dashboard/${currentLeague.key}/team`,
      icon: <Users className="w-4 h-4" />
    },
    { 
      label: "Matchups", 
      href: `/dashboard/${currentLeague.key}/matchups`,
      icon: <Swords className="w-4 h-4" />
    },
    { 
      label: "Standings", 
      href: `/dashboard/${currentLeague.key}/standings`,
      icon: <Trophy className="w-4 h-4" />
    },
    { 
      label: "Free Agents", 
      href: `/dashboard/${currentLeague.key}/free-agents`,
      icon: <UserPlus className="w-4 h-4" />
    },
    { 
      label: "Schedule", 
      href: `/dashboard/${currentLeague.key}/schedule`,
      icon: <Calendar className="w-4 h-4" />
    },
    { 
      label: "Transactions", 
      href: `/dashboard/${currentLeague.key}/transactions`,
      icon: <ArrowRightLeft className="w-4 h-4" />
    },
  ] : [];

  const isActiveTab = (href: string) => pathname.startsWith(href);
  const showLeagueNav = isHydrated && currentLeague && leagueTabs.length > 0;
  const showLeagueSelector = isHydrated && activeLeagues.length > 0;

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-default)] backdrop-blur-sm">
      {/* Main nav row */}
      <nav className="container mx-auto px-4 sm:px-6 h-14 flex items-center">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Left: Logo + League Selector */}
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="flex-shrink-0 flex items-center gap-3"
            >
              <Image
                src="/brand/logo-fantastats.png"
                alt="Fantastats"
                width={120}
                height={28}
                className="h-6 w-auto"
                priority
              />
            </Link>

            {/* League Selector Dropdown */}
            {showLeagueSelector && (
              <>
                <div className="h-5 w-px bg-[var(--border-default)]" />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    <span className="text-[var(--text-primary)] font-medium max-w-[180px] truncate">
                      {currentLeague?.name || "Select League"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-lg overflow-hidden z-50">
                      <div className="py-1">
                        {activeLeagues.map((league) => (
                          <button
                            key={league.key}
                            onClick={() => handleLeagueSelect(league)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--bg-elevated)] transition-colors ${
                              currentLeague?.key === league.key ? 'bg-[var(--interactive)]/10' : ''
                            }`}
                          >
                            <div className="w-6 h-6 rounded bg-[var(--interactive)]/10 flex items-center justify-center shrink-0">
                              <Trophy className="w-3 h-3 text-[var(--interactive)]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{league.name}</p>
                              <p className="text-[10px] text-[var(--text-tertiary)]">{league.numTeams} teams • Week {league.currentWeek}</p>
                            </div>
                            {currentLeague?.key === league.key && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--interactive)]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: Theme toggle + User menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Tab navigation row - only when inside a league */}
      {showLeagueNav && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="container mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
              {leagueTabs.map((tab) => {
                const active = isActiveTab(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                      border-b-2 transition-colors
                      ${active 
                        ? "border-[var(--accent-primary)] text-[var(--accent-primary)]" 
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]"
                      }
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Simple header for landing page (no user menu)
 */
export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/logo-fantastats.png"
            alt="Fantastats"
            width={140}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
