"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { IconBell, IconMenu } from "@/components/icons/DashboardIcons";
import { useAuth } from "@/context/AuthContext";

type Props = {
  onMenuOpen: () => void;
};

export function AppTopBar({ onMenuOpen }: Props) {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--card)]/95 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-[var(--fg)] hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
          aria-label="Open menu"
          onClick={onMenuOpen}
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <p className="hidden text-sm text-[var(--muted)] sm:block">Your academic overview</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button
          type="button"
          className="rounded-lg p-2 text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/10"
          aria-label="Notifications"
        >
          <IconBell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] py-1 pl-1 pr-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{initials}</span>
          <span className="hidden max-w-[10rem] truncate text-sm font-medium text-[var(--fg)] sm:inline">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
