"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ShieldCheck } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Login page - User must click button to start OAuth
 * No auto-redirects that can cause loops
 */
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in with valid session, redirect to leagues
  useEffect(() => {
    if (status === "authenticated" && session && !session.error) {
      router.push("/leagues");
    }
  }, [session, status, router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("yahoo", { callbackUrl: "/leagues" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-2 border-[var(--interactive)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)]">Checking session...</p>
        </div>
      </div>
    );
  }

  // If authenticated but has error, show re-auth option
  if (session?.error) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
              Session Expired
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">
              Your Yahoo session has expired. Please sign in again.
            </p>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--interactive)] hover:bg-[var(--interactive-hover)] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon/yahoo.png" alt="Yahoo" className="h-5 w-5" />
                  Sign In with Yahoo
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Main login page
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-fantastats.png" alt="Fantastats" className="h-8" />
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Welcome Back
            </h1>
            <p className="text-[var(--text-secondary)]">
              Sign in to access your fantasy leagues
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-[var(--card-shadow)]">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--interactive)] hover:bg-[var(--interactive-hover)] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon/yahoo.png" alt="Yahoo" className="h-5 w-5" />
                  Sign In with Yahoo
                </>
              )}
            </button>

            {/* Trust message */}
            <p className="mt-4 text-xs text-[var(--text-tertiary)] text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--success)]" strokeWidth={2} />
              Read-only access · Your data stays safe
            </p>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
