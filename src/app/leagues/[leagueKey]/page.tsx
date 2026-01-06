import { AppHeader } from "@/components/layout/Header";
import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import {
    ArrowRight,
    Calendar,
    ChevronRight,
    Swords,
    TrendingUp,
    Trophy,
    Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
}

export default async function LeagueHomePage({ params }: PageProps) {
  const { leagueKey: rawLeagueKey } = await params;
  const leagueKey = decodeURIComponent(rawLeagueKey);

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/");
  }

  const client = createYahooClient(session.accessToken);

  const [league, myTeam] = await Promise.all([
    client.getLeague(leagueKey),
    client.getMyTeam(leagueKey),
  ]);

  const matchup = myTeam?.key ? await client.getMyMatchup(myTeam.key) : null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AppHeader backHref="/leagues" backLabel="Leagues" />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* League Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] mb-2">
            <Link
              href="/leagues"
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Leagues
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[var(--text-secondary)]">
              {league?.name || "League"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {league?.name || "League"}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <Calendar className="w-4 h-4" />
              Week {league?.current_week ?? "-"}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <Users className="w-4 h-4" />
              {league?.num_teams ?? "-"} Teams
            </span>
          </div>
        </div>

        {!myTeam ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No team found
            </h2>
            <p className="text-[var(--text-secondary)]">
              We couldn&apos;t find a team you own in this league.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <section className="lg:col-span-2 space-y-6">
              {/* Matchup Card */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Swords className="w-5 h-5 text-[var(--interactive)]" />
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        This Week&apos;s Matchup
                      </h2>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--interactive-muted)] text-[var(--interactive)]">
                      Week {league?.current_week}
                    </span>
                  </div>
                </div>

                {!matchup ? (
                  <div className="p-6 text-[var(--text-secondary)] text-sm">
                    Matchup data isn&apos;t available yet.
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Your Team */}
                      <div className="bg-[var(--bg-subtle)] rounded-xl p-5 border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-[var(--success)]" />
                          </div>
                          <span className="text-xs font-medium text-[var(--success)] uppercase tracking-wide">
                            Your Team
                          </span>
                        </div>
                        <h3 className="font-semibold text-[var(--text-primary)] text-lg">
                          {matchup.myTeam.name}
                        </h3>
                        {typeof matchup.myTeam.points === "number" && (
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-[var(--text-primary)]">
                              {matchup.myTeam.points}
                            </span>
                            <span className="text-sm text-[var(--text-tertiary)]">
                              pts
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Opponent */}
                      <div className="bg-[var(--bg-subtle)] rounded-xl p-5 border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
                            <Swords className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </div>
                          <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                            Opponent
                          </span>
                        </div>
                        <h3 className="font-semibold text-[var(--text-primary)] text-lg">
                          {matchup.opponent.name}
                        </h3>
                        {typeof matchup.opponent.points === "number" && (
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-[var(--text-primary)]">
                              {matchup.opponent.points}
                            </span>
                            <span className="text-sm text-[var(--text-tertiary)]">
                              pts
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats Placeholder */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[var(--interactive)]" />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Season Overview
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[var(--bg-subtle)] rounded-lg">
                    <p className="text-2xl font-bold text-[var(--success)]">
                      {myTeam.wins ?? 0}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      Wins
                    </p>
                  </div>
                  <div className="text-center p-4 bg-[var(--bg-subtle)] rounded-lg">
                    <p className="text-2xl font-bold text-[var(--error)]">
                      {myTeam.losses ?? 0}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      Losses
                    </p>
                  </div>
                  <div className="text-center p-4 bg-[var(--bg-subtle)] rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      #{myTeam.rank ?? "-"}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      Rank
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* My Team Card */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  My Team
                </h2>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  View roster & team details
                </p>

                <Link
                  href={`/teams/${encodeURIComponent(myTeam.key)}`}
                  className="group block bg-[var(--bg-subtle)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--interactive)] rounded-xl p-4 transition-all"
                >
                  <div className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--interactive)] transition-colors">
                    {myTeam.name}
                  </div>
                  {typeof myTeam.rank === "number" && (
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      Rank: #{myTeam.rank}
                    </div>
                  )}
                  {typeof myTeam.wins === "number" &&
                    typeof myTeam.losses === "number" && (
                      <div className="text-sm text-[var(--text-secondary)] mt-0.5">
                        Record: {myTeam.wins}-{myTeam.losses}
                        {typeof myTeam.ties === "number" && myTeam.ties > 0
                          ? `-${myTeam.ties}`
                          : ""}
                      </div>
                    )}

                  <div className="mt-4 flex items-center text-sm font-medium text-[var(--interactive)]">
                    View Roster
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <QuickActionLink
                    href={`/teams/${encodeURIComponent(myTeam.key)}`}
                    label="Manage Roster"
                  />
                  <QuickActionLink
                    href="https://basketball.fantasysports.yahoo.com/"
                    label="Open in Yahoo"
                    external
                  />
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function QuickActionLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const baseClasses =
    "flex items-center justify-between w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {label}
        <ChevronRight className="w-4 h-4" />
      </a>
    );
  }

  return (
    <Link href={href} className={baseClasses}>
      {label}
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}
