"use client";

import { useLeague } from "@/contexts";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface LeagueLayoutClientProps {
  children: React.ReactNode;
  leagueKey: string;
}

interface YahooLeague {
  league_key: string;
  league_id: string;
  name: string;
  num_teams: number;
  current_week: number;
}

export function LeagueLayoutClient({ children, leagueKey }: LeagueLayoutClientProps) {
  const { currentLeague, setCurrentLeague } = useLeague();
  const { data: session } = useSession();
  const [debugOpen, setDebugOpen] = useState(false);

  // Fetch league info to set context
  const { data: leagues } = useQuery<YahooLeague[]>({
    queryKey: ["leagues"],
    queryFn: async () => {
      const res = await fetch("/api/yahoo/leagues");
      if (!res.ok) throw new Error("Failed to fetch leagues");
      const data = await res.json();
      // API returns { success: true, leagues: [...], count: ... }
      return data.leagues || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: teamsData } = useQuery({
    queryKey: ["league-teams", leagueKey],
    queryFn: async () => {
      const res = await fetch(`/api/yahoo/leagues/${leagueKey}/teams`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: Boolean(leagueKey),
    staleTime: 5 * 60 * 1000,
  });

  const myTeamKey =
    teamsData?.teams?.find((team: { isOwned?: boolean }) => team.isOwned)?.key || "";

  const { data: rosterData } = useQuery({
    queryKey: ["roster", myTeamKey],
    queryFn: async () => {
      const res = await fetch(`/api/yahoo/roster/${myTeamKey}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: Boolean(myTeamKey),
    staleTime: 5 * 60 * 1000,
  });

  const firstPlayerKey = rosterData?.roster?.[0]?.key || "";

  // Set league context when entering a league
  useEffect(() => {
    if (leagues && leagueKey) {
      const league = leagues.find(l => l.league_key === leagueKey);
      if (league && (!currentLeague || currentLeague.key !== leagueKey)) {
        setCurrentLeague({
          key: league.league_key,
          name: league.name,
        });
      }
    }
  }, [leagues, leagueKey, currentLeague, setCurrentLeague]);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      {children}

      <div className="fixed bottom-4 right-4 z-50">
        {debugOpen && (
          <div className="w-80 max-w-[90vw] rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Debug Keys
              </h3>
              <button
                className="text-xs text-[var(--text-tertiary)]"
                onClick={() => setDebugOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div>
                <p className="text-[var(--text-tertiary)]">League Key</p>
                <code className="block bg-[var(--bg-elevated)] p-2 rounded-md break-all">
                  {leagueKey || "—"}
                </code>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Team Key</p>
                <code className="block bg-[var(--bg-elevated)] p-2 rounded-md break-all">
                  {myTeamKey || "—"}
                </code>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Player Key</p>
                <code className="block bg-[var(--bg-elevated)] p-2 rounded-md break-all">
                  {firstPlayerKey || "—"}
                </code>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Access Token</p>
                <code className="block bg-[var(--bg-elevated)] p-2 rounded-md break-all">
                  {session?.accessToken || "—"}
                </code>
              </div>
            </div>
          </div>
        )}
        {!debugOpen && (
          <button
            className="btn btn-secondary btn-sm shadow-lg"
            onClick={() => setDebugOpen(true)}
          >
            Debug
          </button>
        )}
      </div>
    </main>
  );
}
