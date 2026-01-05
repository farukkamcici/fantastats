import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { UserMenu } from "@/components/auth/UserMenu";
import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
}

export default async function LeagueHomePage({ params }: PageProps) {
  const { leagueKey: rawLeagueKey } = await params;
  const leagueKey = decodeURIComponent(rawLeagueKey);

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/login");
  }

  const client = createYahooClient(session.accessToken);

  const [league, myTeam] = await Promise.all([
    client.getLeague(leagueKey),
    client.getMyTeam(leagueKey),
  ]);

  const matchup = myTeam?.key ? await client.getMyMatchup(myTeam.key) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/leagues" className="text-sm text-gray-600 hover:text-gray-900">
                 Back
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <div>
                <div className="text-xs text-gray-500">League</div>
                <div className="font-semibold text-gray-900">
                  {league?.name || "League"}
                </div>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {league?.name || "League"}
          </h1>
          <p className="text-gray-600 mt-1">
            Week {league?.current_week ?? "-"}
          </p>
        </div>

        {!myTeam ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No team found</h2>
            <p className="text-gray-600">
              We couldnt find a team you own in this league.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">This week</h2>
                    <p className="text-sm text-gray-600">
                      Your current matchup snapshot
                    </p>
                  </div>
                </div>

                {!matchup ? (
                  <div className="mt-4 text-gray-600 text-sm">
                    Matchup data isnt available yet.
                  </div>
                ) : (
                  <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">You</div>
                      <div className="font-semibold text-gray-900">
                        {matchup.myTeam.name}
                      </div>
                      {typeof matchup.myTeam.points === "number" && (
                        <div className="text-sm text-gray-600 mt-1">
                          Points: {matchup.myTeam.points}
                        </div>
                      )}
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Opponent</div>
                      <div className="font-semibold text-gray-900">
                        {matchup.opponent.name}
                      </div>
                      {typeof matchup.opponent.points === "number" && (
                        <div className="text-sm text-gray-600 mt-1">
                          Points: {matchup.opponent.points}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900">My team</h2>
                <p className="text-sm text-gray-600 mt-1">Open roster & team details</p>

                <Link
                  href={`/teams/${encodeURIComponent(myTeam.key)}`}
                  className="mt-4 block border border-purple-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="font-semibold text-gray-900">{myTeam.name}</div>
                  {typeof myTeam.rank === "number" && (
                    <div className="text-sm text-gray-600 mt-1">Rank: {myTeam.rank}</div>
                  )}
                  {typeof myTeam.wins === "number" && typeof myTeam.losses === "number" && (
                    <div className="text-sm text-gray-600 mt-1">
                      Record: {myTeam.wins}-{myTeam.losses}
                      {typeof myTeam.ties === "number" && myTeam.ties > 0 ? `-${myTeam.ties}` : ""}
                    </div>
                  )}

                  <div className="mt-3 text-sm font-medium text-purple-600">
                    View roster 
                  </div>
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
