"use client";

import { LoginButton } from "@/components/auth/LoginButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Login page
 * Redirects to /leagues if already authenticated
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="max-w-md w-full mx-4">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🏀</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Fantastats</h1>
          <p className="text-purple-200">
            Your Yahoo Fantasy Basketball companion
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Sign in with your Yahoo account to access your fantasy basketball data
          </p>

          <LoginButton className="w-full" />

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-4">
              What you&apos;ll get access to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                View your weekly and season stats
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Track matchup progress in real-time
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                See NBA schedule for streaming
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Export your data to CSV
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-purple-300 text-sm mt-6">
          By signing in, you agree to allow Fantastats to access your Yahoo Fantasy data.
          <br />
          We only read your data — we never make changes.
        </p>
      </div>
    </div>
  );
}
