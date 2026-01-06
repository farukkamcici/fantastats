"use client";

import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AppHeaderProps {
  /** Back link URL */
  backHref?: string;
  /** Back link label */
  backLabel?: string;
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Additional classes */
  className?: string;
}

/**
 * Inner App Header Component
 * - Logo always in the same position (left)
 * - Theme toggle always visible (right)
 * - User menu on right
 * - Optional back navigation and title
 */
export function AppHeader({ 
  backHref,
  backLabel,
  title,
  subtitle,
  className = ""
}: AppHeaderProps) {
  return (
    <header className={`sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-default)] backdrop-blur-sm ${className}`}>
      <nav className="container mx-auto px-4 sm:px-6 h-16 flex items-center">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Left: Logo + Back + Title */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Logo - Always visible */}
            <Link 
              href="/" 
              className="flex-shrink-0"
            >
              <Image
                src="/brand/logo-fantastats.png"
                alt="Fantastats"
                width={120}
                height={28}
                className="h-7 w-auto"
                priority
              />
            </Link>

            {/* Divider */}
            {(backHref || title) && (
              <div className="hidden sm:block h-6 w-px bg-[var(--border-default)]" />
            )}

            {/* Back link */}
            {backHref && (
              <Link 
                href={backHref}
                className="hidden sm:flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {backLabel || "Back"}
              </Link>
            )}

            {/* Title & Subtitle */}
            {title && !backHref && (
              <div className="hidden sm:block min-w-0">
                <h1 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-[var(--text-tertiary)] truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Theme toggle + User menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}

/**
 * Simple header for landing page (no user menu)
 */
export function LandingHeader({ className = "" }: { className?: string }) {
  return (
    <header className={`relative z-10 ${className}`}>
      <nav className="container mx-auto px-4 sm:px-6 h-16 flex items-center">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center">
            <Image
              src="/brand/logo-fantastats.png"
              alt="Fantastats"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
