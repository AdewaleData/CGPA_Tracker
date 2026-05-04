"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CgpaChart } from "@/components/CgpaChart";
import { CgpaProgressRing } from "@/components/CgpaProgressRing";
import { StatCard } from "@/components/StatCard";
import { IconBook, IconCalendar, IconStar, IconTrend } from "@/components/icons/DashboardIcons";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.dashboard>> | null>(null);
  const [semesters, setSemesters] = useState<Awaited<ReturnType<typeof api.semesters>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, s] = await Promise.all([api.dashboard(), api.semesters()]);
        if (cancelled) return;
        setData(d);
        setSemesters(s);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeLabel = useMemo(() => {
    if (!data?.active_semester_id) return "No term marked active yet";
    const row = semesters.find((x) => x.id === data.active_semester_id);
    if (!row) return "Current term";
    return row.label ?? `Year ${row.year}, semester ${row.semester}`;
  }, [data, semesters]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-[var(--muted)]">
        <div className="h-10 w-10 animate-pulse rounded-full bg-brand-600/20" />
        <p className="text-sm font-medium">Gathering your latest numbers…</p>
      </div>
    );
  }

  const chartRows = data.gpa_by_semester.map((g) => ({
    label: `Sem ${g.position + 1}`,
    gpa: g.gpa,
  }));

  const active = data.active_semester_id;
  const scale = data.cgpa_scale;
  const maxQuality = data.program_total_credits_estimate * scale;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)] md:text-3xl">Good to see you, {data.user.name}</h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-[var(--muted)]">
            Here is a calm read on your cumulative average, credits, and the term you are working in now. Everything
            below updates from the courses you have saved.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm shadow-sm">
          <span className="text-[var(--muted)]">Program length</span>
          <span className="font-semibold text-[var(--fg)]">{data.user.course_duration}-year plan</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current CGPA"
          value={`${data.current_cgpa.toFixed(2)} / ${scale.toFixed(2)}`}
          hint="Weighted by every completed course we have on file"
          icon={<IconTrend className="h-5 w-5" />}
          trend={
            data.cgpa_delta_vs_last_completed != null ? (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {data.cgpa_delta_vs_last_completed >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(data.cgpa_delta_vs_last_completed).toFixed(2)} since your last finished term
              </p>
            ) : null
          }
        />
        <StatCard
          label="Credits earned"
          value={`${Math.round(data.total_credits)}`}
          hint={`About ${Math.round(data.program_total_credits_estimate)} total units in your plan`}
          icon={<IconBook className="h-5 w-5" />}
        />
        <StatCard
          label="Quality points"
          value={data.total_quality_points.toFixed(2)}
          hint={`Rough ceiling ${maxQuality.toFixed(0)} if every unit were an A on your scale`}
          icon={<IconStar className="h-5 w-5" />}
        />
        <StatCard
          label="This term"
          value={active ? "In progress" : "—"}
          hint={activeLabel}
          icon={<IconCalendar className="h-5 w-5" />}
          trend={
            active ? (
              <Link href={`/semesters/${active}`} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Open courses for this term →
              </Link>
            ) : null
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CgpaChart
            data={chartRows}
            title="CGPA over time"
            subtitle="Each point is the CGPA after a semester you have closed and saved"
            yMax={scale}
          />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--fg)]">At a glance</h3>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Your cumulative average on a {scale.toFixed(2)}-point scale, based on the grades you have entered so far.
          </p>
          <div className="mt-4">
            <CgpaProgressRing cgpa={data.current_cgpa} scale={scale} />
          </div>
          {data.average_semester_gpa > 0 ? (
            <p className="mt-4 text-center text-sm text-[var(--muted)]">
              Average GPA across finished terms:{" "}
              <span className="font-semibold text-[var(--fg)]">{data.average_semester_gpa.toFixed(2)}</span>
            </p>
          ) : null}
          <Link
            href="/reports"
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Open reports
          </Link>
        </div>
      </div>
    </div>
  );
}
