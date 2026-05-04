"use client";

type Props = {
  cgpa: number;
  scale?: number;
};

/** Single-color ring (no gradients). */
export function CgpaProgressRing({ cgpa, scale = 4 }: Props) {
  const pct = Math.min(100, Math.max(0, (cgpa / scale) * 100));
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="relative mx-auto h-[200px] w-[200px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-black/10 dark:text-white/10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-bold tracking-tight text-[var(--fg)]">{cgpa.toFixed(2)}</p>
        <p className="text-sm text-[var(--muted)]">/ {scale.toFixed(2)}</p>
        <p className="mt-1 text-xs font-medium text-brand-600 dark:text-brand-400">{pct.toFixed(1)}%</p>
      </div>
    </div>
  );
}
