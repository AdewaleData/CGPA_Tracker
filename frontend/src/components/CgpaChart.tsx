"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { label: string; gpa: number };

type Props = {
  data: Row[];
  title?: string;
  subtitle?: string;
  className?: string;
  /** Max GPA on chart (4 or 5 scale). */
  yMax?: number;
};

export function CgpaChart({
  data,
  title = "GPA trend",
  subtitle = "Performance across recorded semesters",
  className,
  yMax = 4,
}: Props) {
  const cap = yMax > 4.5 ? 5 : 4;

  if (!data.length) {
    return (
      <div
        className={`flex h-80 flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 text-center shadow-sm ${className ?? ""}`}
      >
        <p className="text-base font-semibold text-[var(--fg)]">{title}</p>
        <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">Add and save courses for at least one semester to plot your GPA curve.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm ${className ?? ""}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--fg)]">{title}</h3>
        <p className="text-sm text-[var(--muted)]">{subtitle}</p>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
            <YAxis domain={[0, cap]} tick={{ fill: "#94a3b8", fontSize: 12 }} width={36} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: "var(--muted)" }}
            />
            <Area type="monotone" dataKey="gpa" stroke="none" fill="#7c3aed" fillOpacity={0.14} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="gpa"
              stroke="#6d28d9"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#6d28d9", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#5b21b6" }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
