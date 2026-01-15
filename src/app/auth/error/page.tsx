"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/**
 * Auth Error Page
 * Handles OAuth errors with clear recovery options
 */
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isClearing, setIsClearing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const getErrorInfo = () => {
    switch (error) {
      case "OAuthSignin":
        return {
          title: "Sign-in Failed",
          message: "Could not start the Yahoo sign-in process. This might be a temporary issue.",
          suggestion: "Try signing in again.",
          showClearSession: false,
        };
      case "OAuthCallback":
        return {
          title: "Authorization Failed", 
          message: "Yahoo did not complete the authorization. You may have denied access or there was a connection issue.",
          suggestion: "Clear your session and try again.",
          showClearSession: true,
        };
      case "OAuthCreateAccount":
        return {
          title: "Account Error",
          message: "Could not create an account with your Yahoo credentials.",
          suggestion: "Try with a different Yahoo account.",
          showClearSession: true,
        };
      case "Callback":
        return {
          title: "Callback Error",
          message: "Something went wrong during the authentication callback.",
          suggestion: "Clear your session and try again.",
          showClearSession: true,
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "You declined the authorization request.",
          suggestion: "You need to allow Fantastats to access your Yahoo Fantasy data.",
          showClearSession: false,
        };
      case "RefreshAccessTokenError":
        return {
          title: "Session Expired",
          message: "Your Yahoo session has expired and could not be refreshed.",
          suggestion: "Sign out completely and sign in again with Yahoo.",
          showClearSession: true,
        };
      case "OAuthAccountNotLinked":
        return {
          title: "Account Conflict",
          message: "This Yahoo account may have been used with a different login method before.",
          suggestion: "Clear your session data and try again.",
          showClearSession: true,
        };
      default:
        return {
          title: "Authentication Error",
          message: "An unexpected error occurred during sign-in.",
          suggestion: "Try clearing your session and signing in again.",
          showClearSession: true,
        };
    }
  };

  const errorInfo = getErrorInfo();

  const handleClearAndRetry = async () => {
    setIsClearing(true);
    try {
      // Sign out completely to clear all session data
      await signOut({ redirect: false });
      // Clear any stuck cookies by waiting a moment
      await new Promise(resolve => setTimeout(resolve, 500));
      // Now start fresh OAuth
      await signIn("yahoo", { callbackUrl: "/leagues" });
    } catch (err) {
      console.error("Error clearing session:", err);
      setIsClearing(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await signIn("yahoo", { callbackUrl: "/leagues" });
    } catch (err) {
      console.error("Error retrying sign-in:", err);
      setIsRetrying(false);
    }
  };

  const handleSignOut = async () => {
    setIsClearing(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[440px]">
          {/* Error Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 mb-5">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
              {errorInfo.title}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {errorInfo.message}
            </p>
          </div>

          {/* Error Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-[var(--card-shadow)]">
            {/* Error Code */}
            {error && (
              <div className="mb-5 p-3 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg">
                <p className="text-xs font-mono text-[var(--text-tertiary)]">
                  Error: {error}
                </p>
              </div>
            )}

            {/* Suggestion */}
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              💡 {errorInfo.suggestion}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              {errorInfo.showClearSession ? (
                <button
                  onClick={handleClearAndRetry}
                  disabled={isClearing}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[var(--interactive)] hover:bg-[var(--interactive-hover)] disabled:opacity-50 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  {isClearing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icon/yahoo.png" alt="Yahoo" className="h-5 w-5" />
                      Clear Session & Sign In Again
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[var(--interactive)] hover:bg-[var(--interactive-hover)] disabled:opacity-50 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  {isRetrying ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icon/yahoo.png" alt="Yahoo" className="h-5 w-5" />
                      Try Again
                    </>
                  )}
                </button>
              )}

              {/* Sign Out Button (if they want to start completely fresh) */}
              {errorInfo.showClearSession && (
                <button
                  onClick={handleSignOut}
                  disabled={isClearing}
                  className="w-full flex items-center justify-center px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium rounded-xl transition-colors duration-200 border border-[var(--border-default)] hover:border-[var(--border-strong)]"
                >
                  Sign Out Completely
                </button>
              )}

              {/* Back Home */}
              <Link
                href="/"
                className="w-full flex items-center justify-center px-4 py-3 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-sm transition-colors duration-200"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            If problems persist, try clearing your browser cookies for this site.
          </p>
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
          <div className="w-8 h-8 border-2 border-[var(--interactive)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
