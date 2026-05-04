"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

export default function SemestersPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof api.semesters>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await api.semesters();
        if (!cancelled) setRows(s);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load semesters");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!rows) return <p className="text-sm text-[var(--muted)]">Loading your semester list…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)] md:text-3xl">Your semesters</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Work through terms in order: when you mark one complete, the next unlocks. That keeps your timeline honest and
          matches how most programs expect you to finish.
        </p>
      </div>
      <ul className="space-y-3">
        {rows.map((s) => {
          const locked = s.status === "upcoming";
          const title = s.label ?? `Year ${s.year} · Semester ${s.semester}`;
          return (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {title}
                  {s.status === "active" ? (
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
                      Current
                    </span>
                  ) : null}
                  {s.status === "completed" ? (
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400">Completed</span>
                  ) : null}
                  {locked ? <span className="ml-2 text-[var(--muted)]">Opens after earlier terms</span> : null}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  GPA: {s.gpa != null ? s.gpa.toFixed(2) : "—"} · Credits: {s.total_credits.toFixed(0)}
                  {s.cgpa != null ? ` · CGPA snapshot: ${s.cgpa.toFixed(2)}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={locked ? "#" : `/semesters/${s.id}`}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    locked
                      ? "cursor-not-allowed border border-[var(--border)] text-[var(--muted)] opacity-60"
                      : s.status === "active"
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-[var(--border)] bg-[var(--card)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  aria-disabled={locked}
                  onClick={(e) => locked && e.preventDefault()}
                >
                  {locked ? "Not yet" : s.status === "active" ? "Edit courses" : "View details"}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
