"use client";

import { AppHeader } from "@/components/layout/Header";
import { SimplifiedLeague } from "@/lib/yahoo/types";
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    ExternalLink,
    Trophy,
    Users,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Leagues page - shows user's NBA fantasy leagues
 * Modern, chic design using the design system
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
        if (response.status === 401) {
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
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            My Leagues
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Select a league to view your dashboard and manage your team
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <LeagueCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLeagues} />
        ) : leagues.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      className="group block bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5 hover:border-[var(--interactive)] hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {league.logoUrl ? (
          <Image
            src={league.logoUrl}
            alt={league.name}
            width={48}
            height={48}
            className="rounded-lg object-cover flex-shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[var(--interactive-muted)] flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-[var(--interactive)]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--interactive)] transition-colors">
            {league.name}
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {league.season} Season
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-[var(--text-tertiary)]">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs">Teams</span>
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">
            {league.numTeams}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-[var(--text-tertiary)]">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs">Week</span>
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">
            {league.currentWeek}
          </p>
        </div>
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              league.isActive
                ? "bg-[var(--success-muted)] text-[var(--success)]"
                : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)]"
            }`}
          >
            {league.isActive ? "Active" : "Ended"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-end text-sm font-medium text-[var(--interactive)] opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Open League</span>
        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

function LeagueCardSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-[var(--bg-subtle)] animate-pulse" />
        <div className="flex-1">
          <div className="h-5 bg-[var(--bg-subtle)] rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-4 bg-[var(--bg-subtle)] rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="h-8 bg-[var(--bg-subtle)] rounded w-full animate-pulse" />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--interactive)] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-secondary)]">Loading your leagues...</p>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--error-muted)] mb-4">
        <AlertTriangle className="w-8 h-8 text-[var(--error)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        Error Loading Leagues
      </h3>
      <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
        {message}
      </p>
      <button onClick={onRetry} className="btn btn-primary">
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-subtle)] mb-4">
        <Trophy className="w-8 h-8 text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        No Leagues Found
      </h3>
      <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
        You don&apos;t have any NBA fantasy leagues on Yahoo this season.
      </p>
      <a
        href="https://basketball.fantasysports.yahoo.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary inline-flex items-center gap-2"
      >
        Join a League on Yahoo
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
