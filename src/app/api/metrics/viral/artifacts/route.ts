import { NextRequest, NextResponse } from "next/server";
import {
  listViralEventsInWindow,
  parseWindowMs,
  summarizeArtifacts,
} from "@/lib/server/viralMetrics";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { windowMs, windowLabel } = parseWindowMs(searchParams.get("window"));

  const limitRaw = searchParams.get("limit");
  const limit = Math.min(200, Math.max(1, Number(limitRaw) || 50));

  const endIso = new Date().toISOString();
  const startIso = new Date(Date.now() - windowMs).toISOString();

  const events = await listViralEventsInWindow({ startIso });
  const items = summarizeArtifacts(events).slice(0, limit);

  return NextResponse.json(
    {
      window: {
        label: windowLabel,
        start: startIso,
        end: endIso,
      },
      items,
      count: items.length,
      updated_at: endIso,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
