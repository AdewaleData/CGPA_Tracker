import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  trend?: ReactNode;
};

export function StatCard({ label, value, hint, icon, trend }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--fg)] md:text-3xl">{value}</p>
          {hint ? <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p> : null}
          {trend ? <div className="mt-2">{trend}</div> : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
