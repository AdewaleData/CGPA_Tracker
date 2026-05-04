"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { AppTopBar } from "@/components/AppTopBar";
import { Sidebar } from "@/components/Sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!mobileNav) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNav(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNav]);

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {mobileNav ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      ) : null}

      <Sidebar mobileOpen={mobileNav} onNavigate={() => setMobileNav(false)} />

      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col lg:flex-1">
        <AppTopBar onMenuOpen={() => setMobileNav(true)} />
        <main className="flex-1 px-4 pb-10 pt-2 md:px-8 md:pt-4">{children}</main>
      </div>
    </div>
  );
}
