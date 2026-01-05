"use client";

import { UserMenu } from "@/components/auth/UserMenu";
import { SimplifiedLeague } from "@/lib/yahoo/types";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Leagues page - shows user's NBA fantasy leagues
 * Redirects to login if not authenticated
 * Handles session errors gracefully
 */
export default function LeaguesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leagues, setLeagues] = useState<SimplifiedLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle auth states
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    // If session has an error (e.g., refresh failed), redirect to error page
    if (session?.error === "RefreshAccessTokenError") {
      router.push("/auth/error?error=RefreshAccessTokenError");
    }
  }, [status, session, router]);

  // Fetch leagues when we have a valid session
  useEffect(() => {
    if (session?.accessToken && !session.error) {
      fetchLeagues();
    }
  }, [session]);

  async function fetchLeagues() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/yahoo/leagues");
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          // Token expired - sign out and redirect
          await signOut({ redirect: false });
          router.push("/auth/error?error=RefreshAccessTokenError");
          return;
        }
        throw new Error(data.message || "Failed to fetch leagues");
      }

      setLeagues(data.leagues || []);
    } catch (err) {
      console.error("Error fetching leagues:", err);
      setError(err instanceof Error ? err.message : "Failed to load leagues");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏀</span>
              <span className="text-xl font-bold text-gray-900">Fantastats</span>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Leagues</h1>
          <p className="text-gray-600 mt-2">
            Select a league to view your dashboard
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LeagueCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLeagues} />
        ) : leagues.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <LeagueCard key={league.key} league={league} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function LeagueCard({ league }: { league: SimplifiedLeague }) {
  return (
    <Link
      href={`/leagues/${encodeURIComponent(league.key)}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all"
    >
      <div className="flex items-start gap-4">
        {league.logoUrl ? (
          <Image
            src={league.logoUrl}
            alt={league.name}
            width={56}
            height={56}
            className="rounded-lg object-cover"
            unoptimized
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center">
            <span className="text-2xl">🏀</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{league.name}</h3>
          <p className="text-sm text-gray-500">{league.season} Season</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Teams:</span>{" "}
            <span className="font-medium text-gray-900">{league.numTeams}</span>
          </div>
          <div>
            <span className="text-gray-500">Week:</span>{" "}
            <span className="font-medium text-gray-900">{league.currentWeek}</span>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                league.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {league.isActive ? "Active" : "Ended"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
        Open League
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function LeagueCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg bg-gray-200" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Leagues</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <span className="text-3xl">🏀</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leagues Found</h3>
      <p className="text-gray-600 mb-4">
        You don&apos;t have any NBA fantasy leagues on Yahoo this season.
      </p>
      <a
        href="https://basketball.fantasysports.yahoo.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Join a League on Yahoo
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}
