"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  CalendarClock,
  Crosshair,
  Flame,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

/**
 * Landing Page - "Your Fantasy Basketball Wingman"
 * 
 * Design principles:
 * - Professional, calm, confident
 * - No neon, no gradients, no flashy animations
 * - Dark mode first, light mode supported
 * - Subtle human touches (scribble underline on "Wingman")
 * - Cold blue (#4A85E6) for CTAs
 * - Deep purple (#6C5DD3) for accent highlights only
 * - Lucide icons from SDK
 */
export default function Home() {
  const { data: session, status } = useSession();

  // Don't auto-redirect logged-in users — let them see the landing page
  // They can click "Dashboard" or "Go to Leagues" to navigate

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* ========== HEADER ========== */}
      <header className="relative z-10">
        <nav className="container mx-auto px-2 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-fantastats.png"
                alt="Fantastats"
                className="h-9"
              />
            </Link>

            {/* Right side: Theme toggle + Sign In */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {status === "loading" ? (
                <div className="w-20 h-9 rounded-lg bg-[var(--bg-subtle)] animate-pulse" />
              ) : session ? (
                <Link
                  href="/leagues"
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => signIn("yahoo", { callbackUrl: "/leagues" })}
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* ========== HERO SECTION ========== */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex items-center justify-center px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[var(--text-primary)] leading-[1.1] tracking-tight mb-6">
              Your Fantasy Basketball{" "}
              <span className="relative inline-block whitespace-nowrap">
                Wingman
                <ScribbleUnderline />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-10 max-w-lg">
              Plan smarter, stream better, and stay one step ahead of your league.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {session ? (
                <Link
                  href="/leagues"
                  className="btn btn-primary inline-flex items-center justify-center gap-3 px-10 py-6 h-12 text-lg font-semibold"
                >
                  Go to My Leagues →
                </Link>
              ) : (
                <button
                  onClick={() => signIn("yahoo", { callbackUrl: "/leagues" })}
                  className="btn btn-primary inline-flex items-center justify-center gap-3 px-10 py-6 h-12 text-lg font-semibold"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon/yahoo.png"
                    alt="Yahoo"
                    className="h-[18px] w-[18px]"
                  />
                  Connect with Yahoo
                </button>
              )}
              <Link
                href="#features"
                className="btn btn-outline inline-flex items-center justify-center px-10 py-6 h-12 text-lg font-semibold"
              >
                See Features
              </Link>
            </div>

            {/* Trust microcopy */}
            {!session && (
              <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--success)]" strokeWidth={2} />
                Read-only access · Your data stays safe
              </p>
            )}
          </div>
        </section>

        {/* Section Divider */}
        <div className="container mx-auto max-w-4xl px-6">
          <div className="h-px bg-[var(--border-default)]" />
        </div>

        {/* ========== FEATURES SECTION ========== */}
        <section id="features" className="px-6 py-16 bg-[var(--bg-surface)]">
          <div className="container mx-auto max-w-4xl">
            {/* Section header - left aligned, less template-y */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Everything you need to win
              </h2>
              <p className="text-[var(--text-secondary)]">
                Less guessing. Better moves.
              </p>
              {/* Small decorative divider - offset, hand-placed feel */}
              <div className="mt-5 flex items-center gap-1">
                <div className="w-8 h-0.5 bg-[var(--accent)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-60" />
              </div>
            </div>

            {/* Feature cards - asymmetric, varied icon treatments */}
            <div className="grid gap-4">
              {/* Featured card - full width, special treatment */}
              <div className="p-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--card-shadow)]">
                <div className="flex items-start gap-4">
                  <IconBadgeFeatured>
                    <Flame className="w-5 h-5" strokeWidth={2} />
                  </IconBadgeFeatured>
                  <div className="pt-0.5">
                    <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">
                      Smart Weekly Planning
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      See your full week at a glance. Know exactly which categories you&apos;re winning, 
                      where you need help, and when to make your move.
                    </p>
                  </div>
                </div>
              </div>

              {/* Two column row - consistent but varied */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--card-shadow)]">
                  <IconBadgeStandard variant="dot">
                    <Crosshair className="w-[18px] h-[18px]" strokeWidth={2} />
                  </IconBadgeStandard>
                  <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-4 mb-1">
                    Matchup Awareness
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Category-by-category breakdowns so you always know where you stand.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--card-shadow)]">
                  <IconBadgeStandard variant="notch">
                    <CalendarClock className="w-[18px] h-[18px]" strokeWidth={2} />
                  </IconBadgeStandard>
                  <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-4 mb-1">
                    Schedule Edge
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Know who plays when. Stream the right guys on the right days.
                  </p>
                </div>
              </div>

              {/* Single card with accent line */}
              <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--card-shadow)] relative overflow-hidden">
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[var(--accent)] rounded-full" />
                <div className="pl-4 flex items-start gap-3">
                  <IconBadgeStandard variant="line">
                    <Sparkles className="w-[18px] h-[18px]" strokeWidth={2} />
                  </IconBadgeStandard>
                  <div className="pt-0.5">
                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">
                      Streaming Insights
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      Find the best available pickups based on your team&apos;s actual needs — not just generic rankings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== BOTTOM CTA SECTION ========== */}
        <section className="px-6 py-14 bg-[var(--bg-base)]">
          <div className="container mx-auto max-w-4xl text-center">
            {session ? (
              <>
                <p className="text-base text-[var(--text-secondary)] mb-5">
                  You&apos;re all set!
                </p>
                <Link
                  href="/leagues"
                  className="btn btn-primary inline-flex items-center justify-center gap-2.5 h-12 px-6 py-3 text-[15px]"
                >
                  View My Leagues →
                </Link>
              </>
            ) : (
              <>
                <p className="text-base text-[var(--text-secondary)] mb-5">
                  Ready to make smarter fantasy moves?
                </p>
                <button
                  onClick={() => signIn("yahoo", { callbackUrl: "/leagues" })}
                  className="btn btn-primary inline-flex items-center justify-center gap-2.5 h-12 px-6 py-3 text-[15px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon/yahoo.png"
                    alt="Yahoo"
                    className="h-[18px] w-[18px]"
                  />
                  Get Started with Yahoo
                </button>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="px-6 py-5 border-t border-[var(--border-subtle)]">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center text-sm text-[var(--text-tertiary)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-fantastats.png"
              alt="Fantastats"
              className="h-5"
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Not affiliated with Yahoo · Built for fantasy basketball players
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ==========================================================================
   CUSTOM ICONS
   ========================================================================== */

/* ==========================================================================
   ICON BADGE COMPONENTS - Branded, varied presentations
   ========================================================================== */

/** Featured icon badge - larger, with accent backing */
function IconBadgeFeatured({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-shrink-0">
      <div className="w-11 h-11 rounded-xl bg-[var(--interactive-muted)] border border-[var(--interactive)]/20 flex items-center justify-center text-[var(--interactive)]">
        {children}
      </div>
      {/* Small accent dot */}
      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
    </div>
  );
}

/** Standard icon badge - with variant treatments */
function IconBadgeStandard({ 
  children, 
  variant = "default" 
}: { 
  children: React.ReactNode;
  variant?: "default" | "dot" | "notch" | "line";
}) {
  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      <div className="w-full h-full rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)]">
        {children}
      </div>
      
      {/* Variant treatments */}
      {variant === "dot" && (
        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
      )}
      {variant === "notch" && (
        <div className="absolute top-0 right-0 w-1.5 h-3 bg-[var(--bg-elevated)] border-l border-b border-[var(--border-default)] rounded-bl-sm" />
      )}
      {variant === "line" && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[var(--accent)] opacity-50" />
      )}
    </div>
  );
}

/* ==========================================================================
   SCRIBBLE UNDERLINE - Hand-drawn accent
   ========================================================================== */

function ScribbleUnderline() {
  return (
    <svg
      className="absolute -bottom-3 left-0 w-full h-4 pointer-events-none"
      viewBox="0 0 200 16"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d="M2 9C18 5 34 13 50 9C66 5 82 13 98 9C114 5 130 13 146 9C162 5 178 13 198 9"
        stroke="var(--accent)"
        strokeWidth="3.25"
        strokeLinecap="round"
      />
    </svg>
  );
}