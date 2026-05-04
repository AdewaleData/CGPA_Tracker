"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { access_token } = await api.login({ email, password });
      setToken(access_token);
      await refresh();
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-10 text-[var(--fg)]">
      <div className="mx-auto flex max-w-md items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 rounded-lg py-1 pr-2 text-[var(--fg)] hover:opacity-90" aria-label="CGPA Tracker Pro home">
          <BrandLogo className="h-10 w-10 shrink-0" />
          <span className="hidden text-sm font-bold tracking-tight sm:inline">CGPA Tracker Pro</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Enter the email and password you used when you signed up. We will take you straight to your dashboard.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Signing you in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm leading-relaxed text-[var(--muted)]">
          First time here?{" "}
          <Link className="font-medium text-brand-600 hover:underline dark:text-brand-400" href="/register">
            Create a free account
          </Link>{" "}
          in a couple of minutes.
        </p>
      </div>
    </div>
  );
}
