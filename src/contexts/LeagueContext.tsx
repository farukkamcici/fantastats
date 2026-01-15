'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface LeagueInfo {
  key: string;
  name: string;
  teamKey?: string;
  teamName?: string;
}

interface LeagueContextType {
  currentLeague: LeagueInfo | null;
  setCurrentLeague: (league: LeagueInfo | null) => void;
  clearLeague: () => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

function loadStoredLeague(): LeagueInfo | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem('currentLeague');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as LeagueInfo;
  } catch {
    sessionStorage.removeItem('currentLeague');
    return null;
  }
}

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [currentLeague, setCurrentLeagueState] = useState<LeagueInfo | null>(null);

  useEffect(() => {
    const stored = loadStoredLeague();
    if (stored) {
      setCurrentLeagueState(stored);
    }
  }, []);

  const setCurrentLeague = (league: LeagueInfo | null) => {
    setCurrentLeagueState(league);
    if (typeof window === 'undefined') return;
    if (league) {
      sessionStorage.setItem('currentLeague', JSON.stringify(league));
    } else {
      sessionStorage.removeItem('currentLeague');
    }
  };

  const clearLeague = () => {
    setCurrentLeagueState(null);
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('currentLeague');
  };

  return (
    <LeagueContext.Provider value={{ currentLeague, setCurrentLeague, clearLeague }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
