"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [cgpaScale, setCgpaScale] = useState<4 | 5>(4);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setCgpaScale(Math.abs(user.cgpa_scale - 5) < 0.01 ? 5 : 4);
  }, [user]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const scaleFloat = cgpaScale === 5 ? 5.0 : 4.0;
      await api.patchMe({
        name: name.trim(),
        cgpa_scale: scaleFloat,
      });
      await refresh();
      setMsg("Saved. If you changed the grading scale, we have already refreshed your course points and CGPA.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return <p className="text-sm text-[var(--muted)]">Loading your settings…</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--fg)] md:text-3xl">Settings</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Update the name we greet you with and the grading cap your school uses. If you switch the scale, we recalc
          stored grade points so CGPA stays consistent.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-[var(--fg)]">Name we should use</span>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none ring-brand-500 focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-[var(--fg)]">Grading cap</legend>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Pick <strong className="text-[var(--fg)]">4.00</strong> or <strong className="text-[var(--fg)]">5.00</strong> to
            match your transcript. Letter grades map to points on that cap (A at the top, F at zero).
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 has-[:checked]:border-brand-600 has-[:checked]:ring-1 has-[:checked]:ring-brand-600">
              <input type="radio" name="scale" checked={cgpaScale === 4} onChange={() => setCgpaScale(4)} />
              <div>
                <p className="font-semibold text-[var(--fg)]">4.00 scale</p>
                <p className="text-xs text-[var(--muted)]">A=4, B=3, C=2, D=1, F=0</p>
              </div>
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 has-[:checked]:border-brand-600 has-[:checked]:ring-1 has-[:checked]:ring-brand-600">
              <input type="radio" name="scale" checked={cgpaScale === 5} onChange={() => setCgpaScale(5)} />
              <div>
                <p className="font-semibold text-[var(--fg)]">5.00 scale</p>
                <p className="text-xs text-[var(--muted)]">A=5, B=4, C=3, D=2, F=0</p>
              </div>
            </label>
          </div>
        </fieldset>

        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        {msg ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{msg}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
