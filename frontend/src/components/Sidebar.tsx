"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BrandLogo } from "@/components/BrandLogo";
import {
  IconCalendar,
  IconCourses,
  IconDashboard,
  IconReports,
  IconSemesters,
  IconSettings,
  IconSpark,
  IconTarget,
} from "@/components/icons/DashboardIcons";
import { useAuth } from "@/context/AuthContext";

const mainLinks: { href: string; label: string; Icon: typeof IconDashboard }[] = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/semesters", label: "Semesters", Icon: IconSemesters },
  { href: "/courses", label: "Add courses", Icon: IconCourses },
  { href: "/reports", label: "Reports", Icon: IconReports },
  { href: "/settings", label: "Settings", Icon: IconSettings },
];

const soonLinks: { label: string; Icon: typeof IconSpark }[] = [
  { label: "Predictions", Icon: IconSpark },
  { label: "Goals", Icon: IconTarget },
  { label: "Calendar", Icon: IconCalendar },
];

type SidebarProps = {
  mobileOpen: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ mobileOpen, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/reports") return pathname === "/reports";
    if (href === "/settings") return pathname === "/settings";
    if (href === "/courses") return pathname === "/courses" || /^\/semesters\/\d+/.test(pathname);
    if (href === "/semesters") return pathname === "/semesters";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-white/5 bg-[#12102a] text-slate-200 shadow-xl transition-transform duration-200 ease-out lg:static lg:z-30 lg:translate-x-0 lg:shadow-none lg:pointer-events-auto ${
          mobileOpen
            ? "translate-x-0 pointer-events-auto"
            : "-translate-x-full pointer-events-none lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
          <BrandLogo className="h-10 w-10 shrink-0 rounded-xl shadow-sm shadow-black/20" />
          <div>
            <p className="text-sm font-bold tracking-tight text-white">CGPA Tracker Pro</p>
            <p className="text-xs text-slate-400">Your courses and CGPA in one place</p>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-3 text-sm">
          {mainLinks.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href + label}
                href={href}
                prefetch
                onClick={() => onNavigate?.()}
                className={`relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" />
                {label}
              </Link>
            );
          })}
          <div className="my-2 border-t border-white/5 pt-2">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">On the roadmap</p>
            {soonLinks.map(({ label, Icon }) => (
              <div
                key={label}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-slate-500"
                title="Not available yet"
              >
                <Icon className="h-5 w-5 shrink-0 opacity-60" />
                {label}
              </div>
            ))}
          </div>
        </nav>

        <div className="p-3">
          <div className="rounded-2xl border border-brand-500/25 bg-brand-600/15 p-4">
            <p className="text-sm font-semibold text-white">Go Premium (soon)</p>
            <p className="mt-1 text-xs leading-relaxed text-violet-200/90">
              Smarter forecasts, polished exports, and extras once we ship the paid tier.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-white py-2 text-sm font-semibold text-brand-800 transition hover:bg-violet-50"
            >
              Upgrade
            </button>
          </div>
        </div>

        <div className="border-t border-white/5 p-4">
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button
            type="button"
            onClick={() => {
              logout();
              onNavigate?.();
              router.replace("/login");
            }}
            className="mt-3 w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
          >
            Log out
          </button>
        </div>
      </aside>
  );
}
