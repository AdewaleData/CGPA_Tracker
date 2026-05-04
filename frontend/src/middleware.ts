import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Ensures Next emits `middleware-manifest.json` in `.next` (avoids dev crash if cache was cleared mid-run). */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
