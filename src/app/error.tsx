"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          We hit an unexpected error. Please try again.
        </p>
        <button className="btn btn-primary" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
