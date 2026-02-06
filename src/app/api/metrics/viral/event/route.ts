import { NextRequest, NextResponse } from "next/server";
import { logViralEvent, VIRAL_EVENT_TYPES, type ViralMetricEventType } from "@/lib/server/viralMetrics";

// Lightweight, public write endpoint for client-side events (views, share copies).
// This intentionally does NOT require auth for MVP; we strictly validate event types.

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as null | Record<string, unknown>;

  const type = typeof body?.type === "string" ? (body!.type as string) : "";
  const artifact_id = typeof body?.artifact_id === "string" ? (body!.artifact_id as string) : null;

  if (!VIRAL_EVENT_TYPES.includes(type as ViralMetricEventType)) {
    return NextResponse.json(
      { error: "Validation failed", details: ["type is required"] },
      { status: 400 }
    );
  }

  // Fire-and-forget. Never block the response on metrics IO.
  void logViralEvent(type as ViralMetricEventType, { artifact_id });

  return NextResponse.json({ success: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  return NextResponse.json(
    {
      endpoint: "/api/metrics/viral/event",
      method: "POST",
      body: {
        type: VIRAL_EVENT_TYPES,
        artifact_id: "art_... (optional)",
      },
    },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
