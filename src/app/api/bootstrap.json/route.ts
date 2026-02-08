import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * GET /api/bootstrap.json
 *
 * Adjustable defaults for agents/humans.
 * Keep prompts and long docs free of hardcoded polling intervals/limits.
 */
export async function GET() {
  const filePath = join(process.cwd(), "public", "bootstrap.json");
  const content = readFileSync(filePath, "utf-8");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
