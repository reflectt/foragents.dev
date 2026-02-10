import { NextRequest, NextResponse } from "next/server";
import { readCanaryRuns } from "@/lib/server/canaryRunsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const runId = typeof id === "string" ? id.trim() : "";

  if (!runId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const runs = await readCanaryRuns();
  const run = runs.find((entry) => entry.id === runId);

  if (!run) {
    return NextResponse.json({ error: "Canary run not found" }, { status: 404 });
  }

  return NextResponse.json(
    { run },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
