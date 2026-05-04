"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { href: "#top", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

function MiniChart() {
  const pts = [3.2, 3.45, 3.3, 3.6, 3.74];
  const w = 220;
  const h = 72;
  const pad = 8;
  const max = 4;
  const minY = 2.8;
  const coords = pts.map((g, i) => {
    const x = pad + (i * (w - pad * 2)) / (pts.length - 1);
    const y = h - pad - ((g - minY) / (max - minY)) * (h - pad * 2);
    return `${x},${y}`;
  });
  const d = `M ${coords.join(" L ")}`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="text-brand-500" preserveAspectRatio="none">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((g, i) => {
        const x = pad + (i * (w - pad * 2)) / (pts.length - 1);
        const y = h - pad - ((g - minY) / (max - minY)) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="4" className="fill-brand-600" />;
      })}
    </svg>
  );
}

export default function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 text-[var(--fg)] backdrop-blur-md dark:border-white/5 dark:bg-[#0c0b14]/95 dark:text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="#top" className="flex items-center gap-3 font-semibold tracking-tight">
            <BrandLogo className="h-9 w-9 shrink-0" />
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-lg text-[var(--fg)]">CGPA Tracker</span>
              <span className="rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold uppercase text-white">Pro</span>
            </span>
          </Link>
          <nav className="hidden flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted)] dark:text-slate-300 lg:flex">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="transition hover:text-[var(--fg)] dark:hover:text-white">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--fg)] hover:bg-black/[0.04] dark:text-slate-200 dark:hover:bg-white/5"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-[var(--border)] bg-slate-50 px-4 pb-16 pt-10 dark:border-white/5 dark:bg-[#07060d] md:px-6 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-[3.25rem]">
              Track your grades. Improve each term.{" "}
              <span className="text-brand-600 dark:text-brand-400">Reach the CGPA you are aiming for.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Add semesters, log courses and letter grades, and watch GPA and CGPA stay in sync. Built for busy students
              on four-, five-, or six-year programs who want clarity without living inside a spreadsheet.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-white/10 dark:text-brand-300">
                  ✓
                </span>
                <span>
                  <strong className="text-slate-900 dark:text-white">GPA and CGPA you can trust</strong>
                  <span className="text-slate-500 dark:text-slate-500"> — </span>
                  Numbers refresh whenever you save a term, so you always see where you stand.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-white/10 dark:text-brand-300">
                  ✓
                </span>
                <span>
                  <strong className="text-slate-900 dark:text-white">Room for longer degrees</strong>
                  <span className="text-slate-500 dark:text-slate-500"> — </span>
                  Choose your program length; we line up semesters so you are not guessing what comes next.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-white/10 dark:text-brand-300">
                  ✓
                </span>
                <span>
                  <strong className="text-slate-900 dark:text-white">Charts that tell a story</strong>
                  <span className="text-slate-500 dark:text-slate-500"> — </span>
                  Spot trends at a glance instead of rereading rows of courses.
                </span>
              </li>
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-700 dark:shadow-brand-900/30"
              >
                Create a free account
                <span aria-hidden>→</span>
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">▶</span>
                Take a quick tour
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
            <p className="mb-3 text-center text-xs text-slate-500 dark:text-slate-500 lg:text-left">Preview — your dashboard after you sign up</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-slate-100 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/5 dark:border-white/10 dark:bg-[#0f0e17] dark:shadow-black/50 dark:ring-white/5">
              <div className="flex min-h-[320px]">
                <div className="hidden w-36 shrink-0 border-r border-white/10 bg-[#12102a] p-3 text-[11px] text-slate-400 sm:block">
                  <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
                  {["Dashboard", "Semesters", "Courses", "Reports", "Predictions", "Goals", "Calendar", "Settings"].map((t, i) => (
                    <div
                      key={t}
                      className={`mb-1 rounded-lg px-2 py-1.5 ${i === 0 ? "bg-white/10 font-medium text-white" : "hover:bg-white/5"}`}
                    >
                      {t}
                    </div>
                  ))}
                  <div className="mt-3 rounded-lg border border-brand-500/30 bg-brand-600/20 p-2 text-[10px] text-violet-100">
                    <p className="font-semibold text-white">Go Premium</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1 bg-[#14121f] p-4 sm:p-5">
                  <p className="text-sm font-medium text-white">
                    Welcome back, <span className="text-brand-300">Alex</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Sample data for illustration</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
                    {[
                      ["Current CGPA", "3.74 / 4.00"],
                      ["Credits", "72 of 136"],
                      ["Grade points", "269 / 400"],
                      ["Average GPA", "3.46"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-white/5 bg-black/25 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{k}</p>
                        <p className="mt-1 text-lg font-bold text-white">{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-500">CGPA trend</p>
                  <div className="mt-2 rounded-xl border border-white/5 bg-black/20 px-2 py-3">
                    <MiniChart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-800/30 bg-brand-700 px-4 py-10 text-white md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-100/90">Looking ahead</p>
            <p className="mt-2 text-xl font-bold md:text-2xl">Plan your next CGPA milestone</p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-brand-100/95">
              Today the app is all about honest tracking. When you are ready for forecasts or advisor-style nudges, this
              strip is where those tools can plug in—without changing how you enter courses day to day.
            </p>
          </div>
          <Link
            href="/register"
            className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-violet-50"
          >
            Get started
          </Link>
        </div>
      </section>

      <section
        id="features"
        className="border-b border-[var(--border)] bg-white px-4 py-16 dark:border-white/5 dark:bg-[var(--bg)] md:px-6 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-[var(--fg)] md:text-4xl">
            Built for real academic life
          </h2>
          <p id="how" className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-slate-600 dark:text-[var(--muted)]">
            You already juggle deadlines, credit loads, and results across years. These features match how you
            actually work—plain language, calm layout, nothing extra in your way.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "Semester timeline",
                d: "See every term in order, know which one is active, and finish a semester before the next one unlocks. No guesswork about where you are in the program.",
              },
              {
                t: "Courses and grades",
                d: "Enter codes, titles, credit units, and letter grades. We handle the arithmetic so GPA and CGPA stay aligned with the scale your school uses.",
              },
              {
                t: "Progress you can see",
                d: "Charts and summaries show momentum over time—helpful before advising meetings or when you are deciding how hard to push next term.",
              },
              {
                t: "Goals that stay grounded",
                d: "Set a target and compare term by term. The numbers stay tied to real courses you have already recorded, not wishful thinking.",
              },
              {
                t: "Reports when you need them",
                d: "Pull a clear view of trends and term GPAs. PDF export is on the roadmap; the data model is ready when you are.",
              },
              {
                t: "Your data, your stack",
                d: "Sign in with a secure token, store records in PostgreSQL you control, and run the API beside the app. Privacy stays in your hands.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm dark:border-[var(--border)] dark:bg-[var(--card)]"
              >
                <h3 className="font-semibold text-slate-900 dark:text-[var(--fg)]">{x.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-[var(--muted)]">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-[var(--border)] bg-slate-100 px-4 py-12 text-center md:px-6 dark:border-white/5 dark:bg-[#0a0914]">
        <p id="about" className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Pricing
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-800 dark:text-white">
          Core tracking is free while you run the app yourself. When predictions, exports, and polish are ready, we will
          add a premium tier you will actually want to pay for—not a paywall in front of basic math.
        </p>
      </section>

      <footer id="contact" className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-10 text-center text-sm text-[var(--muted)] dark:border-white/5 dark:bg-[#07060d] dark:text-slate-500">
        <p className="font-medium text-[var(--fg)] dark:text-slate-300">CGPA Tracker Pro</p>
        <p className="mx-auto mt-2 max-w-lg leading-relaxed">
          For anyone who likes knowing the numbers without fighting the spreadsheet. Sign in to pick up where you left
          off, or create an account to get started in a few minutes.
        </p>
        <div className="mt-6 flex justify-center gap-6">
          <Link href="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Log in
          </Link>
          <Link href="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Create an account
          </Link>
        </div>
      </footer>
    </div>
  );
}
