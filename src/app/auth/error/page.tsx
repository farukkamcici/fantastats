"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Auth Error Page
 * Handles OAuth errors with helpful messaging
 */
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorInfo = () => {
    switch (error) {
      case "OAuthSignin":
        return {
          message: "There was a problem starting the sign-in process.",
          showClearSession: false,
        };
      case "OAuthCallback":
        return {
          message: "There was a problem completing the sign-in. The authorization may have been denied.",
          showClearSession: true,
        };
      case "OAuthCreateAccount":
        return {
          message: "Could not create an account with your Yahoo credentials.",
          showClearSession: false,
        };
      case "Callback":
        return {
          message: "There was an error during the authentication callback.",
          showClearSession: true,
        };
      case "AccessDenied":
        return {
          message: "Access was denied. You may have declined the authorization.",
          showClearSession: false,
        };
      case "RefreshAccessTokenError":
        return {
          message: "Your session has expired. Please sign in again.",
          showClearSession: true,
        };
      case "OAuthAccountNotLinked":
        return {
          message: "A previous session exists. Click 'Clear Session & Try Again' to re-authenticate.",
          showClearSession: true,
        };
      default:
        return {
          message: "An unexpected authentication error occurred.",
          showClearSession: true,
        };
    }
  };

  const errorInfo = getErrorInfo();

  const handleClearAndRetry = async () => {
    // Sign out to clear any stale session, then redirect to trigger fresh OAuth
    await signOut({ redirect: false });
    // Small delay to ensure session is cleared
    setTimeout(() => {
      signIn("yahoo", { callbackUrl: "/leagues" });
    }, 100);
  };

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 mb-5">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
              Authentication Error
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {errorInfo.message}
            </p>
          </div>

          {/* Error Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-[var(--card-shadow)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs font-mono text-red-600 dark:text-red-400">
                  Error code: {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {errorInfo.showClearSession ? (
                <button
                  onClick={handleClearAndRetry}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--interactive)] hover:bg-[var(--interactive-hover)] text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon/yahoo.png"
                    alt="Yahoo"
                    className="h-5 w-5"
                  />
                  Clear Session & Try Again
                </button>
              ) : (
                <button
                  onClick={() => signIn("yahoo", { callbackUrl: "/leagues" })}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--interactive)] hover:bg-[var(--interactive-hover)] text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon/yahoo.png"
                    alt="Yahoo"
                    className="h-5 w-5"
                  />
                  Try Again
                </button>
              )}

              <Link
                href="/"
                className="w-full flex items-center justify-center px-4 py-3 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium rounded-lg transition-colors duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
          <div className="spinner w-8 h-8" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
