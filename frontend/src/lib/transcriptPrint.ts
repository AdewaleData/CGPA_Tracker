import type { TranscriptPayload } from "@/lib/api";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Opens a print-friendly transcript; use the browser’s “Save as PDF” target for a PDF file. */
export function printTranscriptAsPdf(data: TranscriptPayload): void {
  const w = window.open("", "_blank");
  if (!w) {
    alert("Pop-up was blocked. Allow pop-ups for this site, then try again.");
    return;
  }

  const rowsHtml = data.semesters
    .filter((s) => s.courses.length > 0 || s.status !== "upcoming")
    .map((sem) => {
      const title = esc(sem.label ?? `Term ${sem.position + 1}`);
      const meta =
        sem.gpa != null
          ? `<p class="meta">Term GPA: ${sem.gpa.toFixed(2)} · CGPA after this term: ${sem.cgpa != null ? sem.cgpa.toFixed(4) : "—"}</p>`
          : `<p class="meta">${sem.status === "upcoming" ? "Locked" : "No saved GPA yet"}</p>`;

      const table =
        sem.courses.length === 0
          ? "<p class=\"empty\">No courses recorded.</p>"
          : `<table>
            <thead><tr><th>Code</th><th>Title</th><th>Credits</th><th>Grade</th><th>Points</th></tr></thead>
            <tbody>
              ${sem.courses
                .map(
                  (c) =>
                    `<tr><td>${esc(c.course_code)}</td><td>${esc(c.course_title)}</td><td>${c.credit_unit}</td><td>${esc(c.grade)}</td><td>${c.grade_point.toFixed(1)}</td></tr>`,
                )
                .join("")}
            </tbody>
          </table>`;

      return `<section class="term"><h2>${title}</h2>${meta}${table}</section>`;
    })
    .join("");

  const generated = esc(data.generated_at);
  const name = esc(data.user.name);
  const scale = data.user.cgpa_scale;

  w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Results — ${name}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, Segoe UI, sans-serif; color: #111; margin: 24px 32px 48px; line-height: 1.45; }
    h1 { font-size: 1.35rem; margin-bottom: 0.25rem; }
    .sub { color: #555; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .term { page-break-inside: avoid; margin-bottom: 2rem; }
    h2 { font-size: 1.05rem; margin: 0 0 0.35rem; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; }
    .meta { font-size: 0.8rem; color: #444; margin: 0 0 0.6rem; }
    .empty { font-size: 0.85rem; color: #666; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-top: 0.35rem; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    th { background: #f4f4f5; font-weight: 600; }
    td:nth-child(4), td:nth-child(5) { text-align: center; }
    @media print {
      body { margin: 12mm; }
      .term { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>CGPA Tracker — academic summary</h1>
  <p class="sub">${name} · ${scale}-point scale · CGPA ${data.current_cgpa.toFixed(4)} · Total credits ${data.total_credits.toFixed(1)} · Generated ${generated}</p>
  ${rowsHtml}
  <script>setTimeout(function () { window.focus(); window.print(); }, 200);</script>
</body>
</html>`);
  w.document.close();
}
