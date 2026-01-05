"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Login page - Modern, calm, sophisticated design
 * Deep dark mode + clean light mode
 */
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push("/leagues");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px]">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm mb-5">
              <span className="text-3xl">🏀</span>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
              Fantastats
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Your Yahoo Fantasy Basketball companion
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-[var(--card-shadow)]">
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                Sign in to access your fantasy data
              </p>
            </div>

            {/* Yahoo Sign In Button */}
            <button
              onClick={() => signIn("yahoo", { callbackUrl: "/leagues" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--interactive)] hover:bg-[var(--interactive-hover)] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/yahoo.png"
                alt="Yahoo"
                className="h-5 w-5"
              />
              Sign in with Yahoo
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-default)]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[var(--card-bg)] text-[var(--text-tertiary)]">
                  What you&apos;ll get
                </span>
              </div>
            </div>

            {/* Features List */}
            <ul className="space-y-3">
              <FeatureItem text="View your weekly and season stats" />
              <FeatureItem text="Track matchup progress in real-time" />
              <FeatureItem text="See NBA schedule for streaming" />
              <FeatureItem text="Export your data to CSV" />
            </ul>
          </div>

          {/* Learn More Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--interactive)] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to home
            </Link>
          </div>

          {/* Footer Note */}
          <p className="mt-8 text-center text-xs text-[var(--text-muted)] leading-relaxed">
            By signing in, you agree to allow Fantastats to read your Yahoo Fantasy data.
            <br />
            We never make changes to your account.
          </p>
        </div>
      </main>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--success-muted)] flex items-center justify-center">
        <svg
          className="w-3 h-3 text-[var(--success)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {text}
    </li>
  );
}
