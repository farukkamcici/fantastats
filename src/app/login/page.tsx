"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Login page - Now just a redirect/trigger
 * If user is already logged in → go to leagues
 * If not logged in → trigger Yahoo OAuth directly
 */
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      // Already logged in, go to leagues
      router.push("/leagues");
    } else {
      // Not logged in, trigger Yahoo OAuth
      signIn("yahoo", { callbackUrl: "/leagues" });
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="text-center">
        <div className="spinner w-8 h-8 mx-auto mb-4" />
        <p className="text-[var(--text-secondary)]">
          Redirecting to Yahoo...
        </p>
      </div>
    </div>
  );
}
