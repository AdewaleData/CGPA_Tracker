"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CgpaChart } from "@/components/CgpaChart";
import { api } from "@/lib/api";
import { printTranscriptAsPdf } from "@/lib/transcriptPrint";

type Tab = "trend" | "gpa" | "grades";

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("trend");
  const [data, setData] = useState<Awaited<ReturnType<typeof api.dashboard>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await api.dashboard();
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartRows =
    data?.gpa_by_semester.map((g) => ({
      label: `S${g.position + 1}`,
      gpa: g.gpa,
    })) ?? [];

  const barRows =
    data?.gpa_by_semester.map((g) => ({
      name: `S${g.position + 1}`,
      gpa: g.gpa,
    })) ?? [];

  const best = data?.gpa_by_semester.length
    ? data.gpa_by_semester.reduce((a, b) => (b.gpa > a.gpa ? b : a))
    : null;
  const worst = data?.gpa_by_semester.length
    ? data.gpa_by_semester.reduce((a, b) => (b.gpa < a.gpa ? b : a))
    : null;

  const yMax = data ? data.cgpa_scale : 4;

  const tabs: { id: Tab; label: string }[] = [
    { id: "trend", label: "CGPA trend" },
    { id: "gpa", label: "Term GPAs" },
    { id: "grades", label: "Grade mix" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link href="/dashboard" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--fg)] md:text-3xl">Reports</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            Same numbers as your dashboard, arranged for when you want to compare terms or prep for a meeting with an
            advisor.
          </p>
        </div>
        <button
          type="button"
          disabled={pdfBusy}
          onClick={async () => {
            setPdfErr(null);
            setPdfBusy(true);
            try {
              const t = await api.transcript();
              printTranscriptAsPdf(t);
            } catch (e) {
              setPdfErr(e instanceof Error ? e.message : "Could not load transcript");
            } finally {
              setPdfBusy(false);
            }
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--fg)] shadow-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
          title="Opens a print view — choose “Save as PDF” as the printer to download a file"
        >
          {pdfBusy ? "Preparing…" : "Save results as PDF"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-brand-600 text-white shadow-sm"
                : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {pdfErr ? <p className="text-sm text-red-600">{pdfErr}</p> : null}
      {!data && !error ? <p className="text-sm text-[var(--muted)]">Pulling your latest stats…</p> : null}

      {data && tab === "trend" ? (
        <CgpaChart
          data={chartRows}
          title="CGPA trend over time"
          subtitle="Each step is a semester you have already saved; the line shows how CGPA moved afterward"
          yMax={yMax}
        />
      ) : null}

      {data && tab === "gpa" ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--fg)]">GPA for each term</h3>
          <p className="text-sm leading-relaxed text-[var(--muted)]">One bar per semester that already has saved results</p>
          <div className="mt-6 h-80">
            {barRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis domain={[0, yMax > 4.5 ? 5 : 4]} tick={{ fill: "#94a3b8", fontSize: 12 }} width={32} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                    }}
                  />
                  <Bar dataKey="gpa" fill="#7c3aed" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                No term GPAs yet. Add courses to an active semester, then mark it complete.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {data && tab === "grades" ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-sm">
          <p className="text-base font-semibold text-[var(--fg)]">Grade distribution</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            A per-letter chart will land here once we roll up every course across your timeline. Until then, open{" "}
            <strong className="text-[var(--fg)]">Semesters</strong> to review grades term by term.
          </p>
        </div>
      ) : null}

      {data && data.gpa_by_semester.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Strongest term</p>
            <p className="mt-2 text-2xl font-bold text-[var(--fg)]">{best ? best.gpa.toFixed(2) : "—"}</p>
            <p className="text-sm text-[var(--muted)]">{best ? `Term #${best.position + 1}` : ""}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Toughest term</p>
            <p className="mt-2 text-2xl font-bold text-[var(--fg)]">{worst ? worst.gpa.toFixed(2) : "—"}</p>
            <p className="text-sm text-[var(--muted)]">{worst ? `Term #${worst.position + 1}` : ""}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Average GPA</p>
            <p className="mt-2 text-2xl font-bold text-[var(--fg)]">{data.average_semester_gpa.toFixed(2)}</p>
            <p className="text-sm text-[var(--muted)]">Across semesters you have finished</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
