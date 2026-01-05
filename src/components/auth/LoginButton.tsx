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
        className={`btn px-6 py-3 bg-neutral-200 text-neutral-500 cursor-not-allowed ${className}`}
      >
        <div className="spinner w-4 h-4" />
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className={`btn px-6 py-3 bg-error hover:opacity-90 text-white font-medium ${className}`}
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("yahoo", { callbackUrl: "/leagues" })}
      className={`btn btn-primary px-6 py-3 ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.9 2.4l4.5 8.4h5.1L14.1 2.4h-1.2zm-1.8 0H9.9l-8.4 8.4h5.1l4.5-8.4zm1.8 10.8l-1.8 3.6v4.8h1.8v-4.8l-1.8-3.6H9.3l2.7 5.1 2.7-5.1h-1.8z" />
      </svg>
      Sign in with Yahoo
    </button>
  );
}

export default LoginButton;
