"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

export default function CoursesRedirectPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Taking you to the term you are working on…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await api.dashboard();
        if (cancelled) return;
        if (d.active_semester_id) router.replace(`/semesters/${d.active_semester_id}`);
        else {
          setMsg("No active term right now. Opening your semester list instead.");
          router.replace("/semesters");
        }
      } catch {
        if (!cancelled) router.replace("/semesters");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--muted)]">
      {msg}
    </div>
  );
}
