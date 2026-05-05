/** Same-origin in the browser (proxied by Next) unless NEXT_PUBLIC_API_URL overrides. */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/backend-api";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

export type MeUser = {
  id: number;
  name: string;
  email: string;
  course_duration: number;
  cgpa_scale: number;
};

export type TranscriptCourse = {
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: string;
  grade_point: number;
};

export type TranscriptSemester = {
  id: number;
  year: number;
  semester: number;
  position: number;
  status: string;
  label: string | null;
  gpa: number | null;
  cgpa: number | null;
  total_credits: number;
  courses: TranscriptCourse[];
};

export type TranscriptPayload = {
  generated_at: string;
  user: MeUser;
  current_cgpa: number;
  total_credits: number;
  total_quality_points: number;
  semesters: TranscriptSemester[];
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cgpa_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("cgpa_token", token);
  else localStorage.removeItem("cgpa_token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const t = getToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch (e) {
    const hint =
      typeof window !== "undefined"
        ? ` Cannot reach API (${API_BASE}). Start the backend and ensure CORS allows ${window.location.origin}.`
        : "";
    throw new Error(e instanceof Error ? `${e.message}.${hint}` : `Request failed.${hint}`);
  }
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new Error(text.slice(0, 200) || res.statusText);
    }
  }
  if (!res.ok) {
    const raw = data as { detail?: unknown } | null;
    const detail = raw?.detail ?? res.statusText;
    const msg = typeof detail === "string" ? detail : JSON.stringify(detail);
    throw new ApiRequestError(msg, res.status, data);
  }
  return data as T;
}

export const api = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    course_duration: number;
    cgpa_scale: number;
  }) => request<{ access_token: string }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<MeUser>("/auth/me"),
  patchMe: (body: { name?: string; cgpa_scale?: number }) =>
    request<MeUser>("/auth/me", { method: "PATCH", body: JSON.stringify(body) }),
  semesters: () =>
    request<
      {
        id: number;
        year: number;
        semester: number;
        position: number;
        status: string;
        label: string | null;
        gpa: number | null;
        cgpa: number | null;
        total_credits: number;
      }[]
    >("/semesters"),
  semester: (id: number) =>
    request<{
      id: number;
      year: number;
      semester: number;
      position: number;
      status: string;
      label: string | null;
      gpa: number | null;
      cgpa: number | null;
      total_credits: number;
      courses: {
        id: number;
        course_code: string;
        course_title: string;
        credit_unit: number;
        grade: string;
        grade_point: number;
      }[];
    }>(`/semester/${id}`),
  syncCourses: (body: { semester_id: number; courses: Record<string, unknown>[] }) =>
    request<unknown>("/courses/sync", { method: "POST", body: JSON.stringify(body) }),
  completeSemester: (id: number) => request<{ ok: boolean }>(`/semester/${id}/complete`, { method: "POST" }),
  dashboard: () =>
    request<{
      current_cgpa: number;
      total_credits: number;
      total_quality_points: number;
      program_total_credits_estimate: number;
      cgpa_scale: number;
      active_semester_id: number | null;
      gpa_by_semester: { position: number; gpa: number }[];
      cgpa_delta_vs_last_completed: number | null;
      average_semester_gpa: number;
      user: MeUser;
    }>("/dashboard"),
  transcript: () => request<TranscriptPayload>("/transcript"),
};
