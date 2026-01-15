"use strict";
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
  const [profile, setProfile] = useState<{ nickname?: string; image_url?: string } | null>(null);
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

  useEffect(() => {
    if (session?.accessToken) {
      fetch("/api/yahoo/user/profile")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profile) {
            setProfile(data.profile);
          }
        })
        .catch(err => console.error("Failed to fetch profile:", err));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div
        className={`w-9 h-9 rounded-full bg-[var(--bg-elevated)] animate-pulse border border-[var(--border-subtle)] ${className}`}
      />
    );
  }

  if (!session) {
    return null;
  }

  const userInitial = (profile?.nickname || session.user?.name || "U")[0]?.toUpperCase();
  const userImage = profile?.image_url || session.user?.image;
  const userName = profile?.nickname || session.user?.name || "Fantasy User";
  const userEmail = session.user?.email || "";

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-3 p-1 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
              isOpen ? "bg-[var(--bg-elevated)] ring-1 ring-[var(--border-subtle)]" : "hover:bg-[var(--bg-subtle)]"
            }`}
          >
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover border border-[var(--border-subtle)]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-600 text-white flex items-center justify-center font-semibold text-sm shadow-inner">
                {userInitial}
              </div>
            )}
            <div className="hidden md:block text-left mr-1">
               <p className="text-sm font-medium text-[var(--text-primary)] leading-none mb-0.5">{userName}</p>
               <p className="text-[10px] text-[var(--text-tertiary)] leading-none">Yahoo Sports</p>
            </div>
            <svg
              className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-0 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl">
          {/* User Info Header */}
          <div className="px-5 py-4 bg-[var(--bg-subtle)]/50 border-b border-[var(--border-subtle)]">
             <div className="flex items-center gap-3">
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={userName}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-[var(--border-default)]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-lg">
                    {userInitial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] truncate text-sm">
                    {userName}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">
                    {userEmail}
                  </p>
                </div>
             </div>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mr-3 group-hover:bg-[var(--bg-surface)] transition-colors border border-[var(--border-subtle)]">
                  <svg className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                My Leagues
              </Link>
            </DropdownMenuItem>
          </div>

          <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30">
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-[var(--bg-elevated)] focus:bg-[var(--bg-elevated)] focus:text-red-700 dark:focus:text-red-300 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default UserMenu;
