import { authOptions } from "@/lib/auth";
import { buildGamesByTeamId, getStreamingSuggestions, type StreamingSuggestion } from "@/lib/analysis/streaming";
import { StreamerList } from "@/components/streaming/StreamerList";
import { NbaClient } from "@/lib/nba/client";
import { createYahooClient } from "@/lib/yahoo/client";
import type { SimplifiedPlayer } from "@/lib/yahoo/types";
import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
  searchParams?: Promise<{ q?: string; position?: string; start?: string }>;
}

const DEFAULT_COUNT = 25;

export default async function FreeAgentsPage({ params, searchParams }: PageProps) {
  const { leagueKey } = await params;
  const { q, position, start } = (await searchParams) || {};

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/");
  }

  const client = createYahooClient(session.accessToken);

  const pageStart = start ? Math.max(parseInt(start, 10), 0) : 0;
  const pageCount = DEFAULT_COUNT;

  let players: SimplifiedPlayer[] = [];
  let streamingSuggestions: StreamingSuggestion[] = [];
  let weekRange: { startDate: string; endDate: string } | null = null;
  try {
    if (q) {
      players = await client.searchPlayers(leagueKey, q);
    } else {
      players = await client.getFreeAgents(leagueKey, {
        status: "FA",
        position: position || undefined,
        count: pageCount,
        start: pageStart,
      });
    }

    if (players.length > 0) {
      weekRange = getWeekRange(new Date());
      const nbaClient = new NbaClient();
      const games = await nbaClient.getGames({
        startDate: weekRange.startDate,
        endDate: weekRange.endDate,
      });
      const gamesByTeamId = buildGamesByTeamId(games);
      streamingSuggestions = getStreamingSuggestions(players, gamesByTeamId, 6);
    }
  } catch (error) {
    console.error("Error fetching free agents:", error);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Free Agents
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Browse available players to add to your roster
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center" method="get">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Search players..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm text-[var(--text-primary)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[var(--text-tertiary)]" />
            <select
              name="position"
              defaultValue={position || ""}
              className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm text-[var(--text-primary)]"
            >
              <option value="">All Positions</option>
              <option value="PG">PG</option>
              <option value="SG">SG</option>
              <option value="SF">SF</option>
              <option value="PF">PF</option>
              <option value="C">C</option>
              <option value="G">G</option>
              <option value="F">F</option>
              <option value="UTIL">UTIL</option>
            </select>
            <button className="btn btn-primary btn-sm" type="submit">
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Player List */}
      {players.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--accent-muted)] flex items-center justify-center">
            <UserPlus className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No players found
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Try a different search or filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.key}
              className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  {player.name}
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {player.teamAbbr} · {player.position}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                  {player.percentOwned !== undefined
                    ? `${Math.round(player.percentOwned)}% owned`
                    : "Ownership N/A"}
                </span>
                <button className="btn btn-outline btn-sm" type="button">
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Streaming Suggestions */}
      {streamingSuggestions.length > 0 && weekRange && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Streaming Suggestions
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                Based on games scheduled from {weekRange.startDate} to {weekRange.endDate}
              </p>
            </div>
          </div>
          <StreamerList suggestions={streamingSuggestions} />
        </div>
      )}

      {/* Pagination */}
      {!q && (
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/${leagueKey}/free-agents?start=${Math.max(pageStart - pageCount, 0)}${position ? `&position=${position}` : ""}`}
            className={`text-sm px-3 py-2 rounded-lg border ${
              pageStart === 0
                ? "border-[var(--border-subtle)] text-[var(--text-muted)] pointer-events-none"
                : "border-[var(--border-default)] text-[var(--text-secondary)]"
            }`}
          >
            Previous
          </Link>
          <Link
            href={`/dashboard/${leagueKey}/free-agents?start=${pageStart + pageCount}${position ? `&position=${position}` : ""}`}
            className={`text-sm px-3 py-2 rounded-lg border ${
              players.length < pageCount
                ? "border-[var(--border-subtle)] text-[var(--text-muted)] pointer-events-none"
                : "border-[var(--border-default)] text-[var(--text-secondary)]"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}

function getWeekRange(date: Date) {
  const day = date.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
  };
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
