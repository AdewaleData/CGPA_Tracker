"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { api, setToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseDuration, setCourseDuration] = useState<4 | 5 | 6>(4);
  const [cgpaScale, setCgpaScale] = useState<4 | 5>(4);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { access_token } = await api.register({
        name,
        email,
        password,
        course_duration: courseDuration,
        cgpa_scale: cgpaScale === 5 ? 5.0 : 4.0,
      });
      setToken(access_token);
      await refresh();
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-10 text-[var(--fg)]">
      <div className="mx-auto flex max-w-md justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Tell us your name, email, and how long your degree runs. We create the semester list for you so you can start
          adding courses right away.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium">
            Full name
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
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
            Password (min 8 characters)
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <fieldset>
            <legend className="text-sm font-medium">How long is your program?</legend>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              {([4, 5, 6] as const).map((y) => (
                <label key={y} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="duration"
                    checked={courseDuration === y}
                    onChange={() => setCourseDuration(y)}
                  />
                  {y} years ({y * 2} semesters)
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium">Grading scale at your school</legend>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Most schools use a 4.00 or 5.00 cap. Pick the one that matches your transcript so letter grades convert the
              way your office of records expects.
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="cgpa" checked={cgpaScale === 4} onChange={() => setCgpaScale(4)} />
                4.00 (A=4 … F=0)
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="cgpa" checked={cgpaScale === 5} onChange={() => setCgpaScale(5)} />
                5.00 (A=5 … F=0)
              </label>
            </div>
          </fieldset>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Creating your workspace…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm leading-relaxed text-[var(--muted)]">
          Already registered?{" "}
          <Link className="font-medium text-brand-600 hover:underline dark:text-brand-400" href="/login">
            Log in instead
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
