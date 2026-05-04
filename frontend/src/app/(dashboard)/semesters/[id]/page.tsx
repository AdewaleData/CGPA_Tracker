"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { letterGradePoints } from "@/lib/grades";

type Row = { course_code: string; course_title: string; credit_unit: string; grade: string };

const GRADES = ["A", "B", "C", "D", "F"] as const;

function emptyRow(): Row {
  return { course_code: "", course_title: "", credit_unit: "3", grade: "A" };
}

export default function SemesterCoursesPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof api.semester>> | null>(null);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const readonly = detail != null && detail.status !== "active";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await api.semester(id);
        if (cancelled) return;
        setDetail(d);
        if (d.courses.length) {
          setRows(
            d.courses.map((c) => ({
              course_code: c.course_code,
              course_title: c.course_title,
              credit_unit: String(c.credit_unit),
              grade: c.grade,
            })),
          );
        } else {
          setRows(d.status === "active" ? [emptyRow()] : []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load semester");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const totals = useMemo(() => {
    const gpMap = letterGradePoints(user?.cgpa_scale ?? 4);
    let credits = 0;
    let qp = 0;
    for (const r of rows) {
      const c = parseFloat(r.credit_unit);
      if (!r.course_code.trim() || Number.isNaN(c) || c <= 0) continue;
      const gp = gpMap[r.grade] ?? 0;
      credits += c;
      qp += c * gp;
    }
    const gpa = credits > 0 ? qp / credits : 0;
    return { credits, qp, gpa };
  }, [rows, user?.cgpa_scale]);

  async function save() {
    if (!detail || detail.status !== "active") return;
    setBusy(true);
    setError(null);
    try {
      const courses = rows
        .filter((r) => r.course_code.trim())
        .map((r) => ({
          course_code: r.course_code.trim(),
          course_title: r.course_title.trim() || r.course_code.trim(),
          credit_unit: parseFloat(r.credit_unit),
          grade: r.grade,
        }));
      await api.syncCourses({ semester_id: detail.id, courses });
      const d = await api.semester(id);
      setDetail(d);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (!detail) return;
    setBusy(true);
    setError(null);
    try {
      await api.completeSemester(detail.id);
      router.push("/semesters");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete semester");
    } finally {
      setBusy(false);
    }
  }

  if (error && !detail) return <p className="text-sm text-red-600">{error}</p>;
  if (!detail) return <p className="text-sm text-[var(--muted)]">Loading this semester…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/semesters" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
            ← All semesters
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--fg)]">{detail.label ?? `Semester #${detail.id}`}</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            {detail.status === "active"
              ? "You can edit courses below. Save whenever you make changes."
              : detail.status === "completed"
                ? "This term is closed—courses are read-only."
                : "This term is still locked until earlier terms are finished."}
            {detail.gpa != null ? ` Saved GPA: ${detail.gpa.toFixed(2)}.` : ""}
            {detail.cgpa != null ? ` CGPA after this term: ${detail.cgpa.toFixed(2)}.` : ""}
          </p>
        </div>
        {detail.status === "active" ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={complete}
              disabled={busy || totals.credits <= 0}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
            >
              Mark this term complete
            </button>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-black/5 text-xs uppercase text-[var(--muted)] dark:bg-white/5">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Credits</th>
              <th className="px-3 py-2">Grade</th>
              {!readonly ? <th className="px-3 py-2" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-2">
                  <input
                    disabled={readonly}
                    className="w-full rounded border border-transparent bg-transparent px-2 py-1 outline-none focus:border-brand-500 disabled:opacity-70"
                    value={r.course_code}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...r, course_code: e.target.value };
                      setRows(next);
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={readonly}
                    className="w-full min-w-[10rem] rounded border border-transparent bg-transparent px-2 py-1 outline-none focus:border-brand-500 disabled:opacity-70"
                    value={r.course_title}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...r, course_title: e.target.value };
                      setRows(next);
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={readonly}
                    type="number"
                    min={0}
                    step={0.5}
                    className="w-20 rounded border border-transparent bg-transparent px-2 py-1 outline-none focus:border-brand-500 disabled:opacity-70"
                    value={r.credit_unit}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...r, credit_unit: e.target.value };
                      setRows(next);
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    disabled={readonly}
                    className="rounded border border-[var(--border)] bg-transparent px-2 py-1 disabled:opacity-70"
                    value={r.grade}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...r, grade: e.target.value };
                      setRows(next);
                    }}
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </td>
                {!readonly ? (
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readonly ? (
        <button
          type="button"
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          onClick={() => setRows([...rows, emptyRow()])}
        >
          + Add another course
        </button>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm">
          <p className="text-[var(--muted)]">Credits in this draft</p>
          <p className="text-xl font-semibold">{totals.credits.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm">
          <p className="text-[var(--muted)]">Quality points (draft)</p>
          <p className="text-xl font-semibold">{totals.qp.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm">
          <p className="text-[var(--muted)]">Term GPA from this draft</p>
          <p className="text-xl font-semibold">{totals.gpa.toFixed(3)}</p>
        </div>
      </div>
    </div>
  );
}
