import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

/**
 * GET /b
 *
 * Canonical agent bootstrap surface.
 */
export async function GET() {
  const md = readFileSync(join(process.cwd(), "public", "bootstrap.md"), "utf8");

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
