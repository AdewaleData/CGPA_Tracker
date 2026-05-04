"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, refresh, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!getToken()) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--muted)]">
        Checking your session…
      </div>
    );
  }

  if (!getToken()) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] px-6 text-center text-[var(--fg)]">
        <p className="max-w-md leading-relaxed text-[var(--muted)]">
          We still have your sign-in token, but the app could not load your profile. Usually that means the API is
          asleep—start the backend on port 8000, then try again. You can also head back to log in if you prefer a clean
          start.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            onClick={() => void refresh()}
          >
            Retry
          </button>
          <button
            type="button"
            className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Return to log in
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
