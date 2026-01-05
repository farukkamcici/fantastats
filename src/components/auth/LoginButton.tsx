"use client";

import { signIn, signOut, useSession } from "next-auth/react";

interface LoginButtonProps {
  className?: string;
}

/**
 * Login button component that handles Yahoo OAuth sign-in
 */
export function LoginButton({ className = "" }: LoginButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed ${className}`}
      >
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className={`inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors ${className}`}
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("yahoo", { callbackUrl: "/leagues" })}
      className={`inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors ${className}`}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.9 2.4l4.5 8.4h5.1L14.1 2.4h-1.2zm-1.8 0H9.9l-8.4 8.4h5.1l4.5-8.4zm1.8 10.8l-1.8 3.6v4.8h1.8v-4.8l-1.8-3.6H9.3l2.7 5.1 2.7-5.1h-1.8z" />
      </svg>
      Sign in with Yahoo
    </button>
  );
}

export default LoginButton;
