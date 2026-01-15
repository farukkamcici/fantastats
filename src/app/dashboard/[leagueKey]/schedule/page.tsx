import { authOptions } from "@/lib/auth";
import { NbaClient } from "@/lib/nba/client";
import type { NbaGame } from "@/lib/nba/types";
import { Calendar, Clock } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
}

export default async function SchedulePage({ params }: PageProps) {
  await params;

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/");
  }

  const { startDate, endDate, days } = getWeekRange(new Date());
  let games: NbaGame[] = [];

  try {
    const nbaClient = new NbaClient();
    games = await nbaClient.getGames({ startDate, endDate });
  } catch (error) {
    console.error("Error fetching NBA schedule:", error);
  }

  const gamesByDate = groupGamesByDate(games);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Schedule
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          View NBA game schedule and plan your roster moves
        </p>
      </div>

      {/* Schedule Grid */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <Calendar className="w-4 h-4" />
            <span>
              Week of {startDate} – {endDate}
            </span>
          </div>
          <div className="text-xs text-[var(--text-tertiary)]">
            {games.length} games this week
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px] grid grid-cols-7 gap-3">
            {days.map((day) => {
              const dayGames = gamesByDate.get(day.key) || [];
              return (
                <div
                  key={day.key}
                  className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 flex flex-col gap-2"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                      {day.label}
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {day.dayNumber}
                    </p>
                  </div>
                  {dayGames.length === 0 ? (
                    <div className="text-xs text-[var(--text-tertiary)]">No games</div>
                  ) : (
                    <div className="space-y-2">
                      {dayGames.map((game) => (
                        <div
                          key={game.id}
                          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2"
                        >
                          <div className="text-xs text-[var(--text-secondary)]">
                            {game.visitor_team.abbreviation} @ {game.home_team.abbreviation}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                            <Clock className="w-3 h-3" />
                            {formatGameTime(game)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekRange(date: Date) {
  const day = date.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const days = Array.from({ length: 7 }).map((_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return {
      key: formatDateKey(current),
      label: current.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: current.getDate(),
    };
  });

  return {
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
    days,
  };
}

function groupGamesByDate(games: NbaGame[]) {
  const map = new Map<string, NbaGame[]>();
  games.forEach((game) => {
    const dateKey = game.date.slice(0, 10);
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey)?.push(game);
  });
  return map;
}

function formatGameTime(game: NbaGame) {
  if (game.status && game.status !== "Final" && game.status !== "Scheduled") {
    return game.status;
  }
  if (!game.datetime) {
    return game.status;
  }
  const date = new Date(game.datetime);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
