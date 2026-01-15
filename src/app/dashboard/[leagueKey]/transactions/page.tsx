import { ExportButton } from "@/components/export/ExportButton";
import { authOptions } from "@/lib/auth";
import { createYahooClient } from "@/lib/yahoo/client";
import type { SimplifiedTransaction } from "@/lib/yahoo/types";
import { ArrowRightLeft, Calendar, Filter } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ leagueKey: string }>;
  searchParams?: Promise<{ start?: string; count?: string; types?: string }>;
}

const DEFAULT_COUNT = 25;

function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function TransactionsPage({ params, searchParams }: PageProps) {
  const { leagueKey } = await params;
  const { start, count, types } = (await searchParams) || {};

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/");
  }

  const client = createYahooClient(session.accessToken);

  const pageStart = start ? Math.max(parseInt(start, 10), 0) : 0;
  const pageCount = count ? Math.min(parseInt(count, 10), 50) : DEFAULT_COUNT;

  let transactions: SimplifiedTransaction[] = [];
  try {
    transactions = await client.getTransactions(leagueKey, {
      start: pageStart,
      count: pageCount,
      types: types || undefined,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Transactions
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Recent adds, drops, and trades in your league
          </p>
        </div>
        <ExportButton
          href={`/api/export/csv?type=transactions&leagueKey=${leagueKey}`}
          label="Export Transactions"
        />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
          <Link
            href={`/dashboard/${leagueKey}/transactions`}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
              !types ? "border-[var(--interactive)] text-[var(--interactive)]" : "border-[var(--border-default)] text-[var(--text-tertiary)]"
            }`}
          >
            All
          </Link>
          {["add", "drop", "trade", "waiver"].map((type) => (
            <Link
              key={type}
              href={`/dashboard/${leagueKey}/transactions?types=${type}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                types === type
                  ? "border-[var(--interactive)] text-[var(--interactive)]"
                  : "border-[var(--border-default)] text-[var(--text-tertiary)]"
              }`}
            >
              {type}
            </Link>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--accent-muted)] flex items-center justify-center">
            <ArrowRightLeft className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No transactions yet
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Transactions will appear here as they happen in your league.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.key}
              className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                    {transaction.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                    {transaction.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                  <Calendar className="w-3 h-3" />
                  {formatDate(transaction.timestamp)} · {formatTime(transaction.timestamp)}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {transaction.players.map((player) => (
                  <div
                    key={`${transaction.key}-${player.key}-${player.type}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--bg-elevated)] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
                        {player.type}
                      </span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {player.name}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {player.sourceTeamName || player.sourceTeamKey || "—"}{" "}
                      {player.destTeamName || player.destTeamKey ? "→" : ""}{" "}
                      {player.destTeamName || player.destTeamKey || ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/${leagueKey}/transactions?start=${Math.max(pageStart - pageCount, 0)}&count=${pageCount}${types ? `&types=${types}` : ""}`}
          className={`text-sm px-3 py-2 rounded-lg border ${
            pageStart === 0
              ? "border-[var(--border-subtle)] text-[var(--text-muted)] pointer-events-none"
              : "border-[var(--border-default)] text-[var(--text-secondary)]"
          }`}
        >
          Previous
        </Link>
        <Link
          href={`/dashboard/${leagueKey}/transactions?start=${pageStart + pageCount}&count=${pageCount}${types ? `&types=${types}` : ""}`}
          className={`text-sm px-3 py-2 rounded-lg border ${
            transactions.length < pageCount
              ? "border-[var(--border-subtle)] text-[var(--text-muted)] pointer-events-none"
              : "border-[var(--border-default)] text-[var(--text-secondary)]"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
