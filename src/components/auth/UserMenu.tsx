"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface UserMenuProps {
  className?: string;
}

/**
 * User menu dropdown component for authenticated users
 */
export function UserMenu({ className = "" }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div
        className={`w-10 h-10 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] animate-pulse ${className}`}
      />
    );
  }

  if (!session) {
    return null;
  }

  const userInitial = session.user?.name?.[0]?.toUpperCase() || "U";
  const userImage = session.user?.image;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--bg-subtle)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {userImage ? (
          <Image
            src={userImage}
            alt={session.user?.name || "User"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover border-2 border-[var(--border-default)]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-lg">
            {userInitial}
          </div>
        )}
        <svg
          className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-elevated)] rounded-lg shadow-lg border border-[var(--border-default)] py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <p className="font-semibold text-[var(--text-primary)] truncate">
              {session.user?.name || "User"}
            </p>
            <p className="text-sm text-[var(--text-tertiary)] truncate">
              {session.user?.email || ""}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/leagues"
              className="flex items-center px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-3 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              My Leagues
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-[var(--border-subtle)] py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--error-muted)]"
            >
              <svg className="w-4 h-4 mr-3 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
