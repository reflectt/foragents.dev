import { NextRequest, NextResponse } from "next/server";
import {
  listViralEventsInWindow,
  parseWindowMs,
  summarizeViralEvents,
} from "@/lib/server/viralMetrics";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { windowMs, windowLabel } = parseWindowMs(searchParams.get("window"));

  const endIso = new Date().toISOString();
  const startIso = new Date(Date.now() - windowMs).toISOString();

  const events = await listViralEventsInWindow({ startIso });
  const summary = summarizeViralEvents(events);

  return NextResponse.json(
    {
      window: {
        label: windowLabel,
        start: startIso,
        end: endIso,
      },
      totals: summary,
      updated_at: endIso,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
