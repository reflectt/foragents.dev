import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import { logViralEvent, VIRAL_EVENT_TYPES, type ViralMetricEventType } from "@/lib/server/viralMetrics";

// Lightweight, public write endpoint for client-side events (views, share copies).
// This intentionally does NOT require auth for MVP; we strictly validate event types.

const MAX_JSON_BYTES = 2_000;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`viral:event:${ip}`, { windowMs: 60_000, max: 120 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(request, MAX_JSON_BYTES);

    const type = typeof body?.type === "string" ? (body.type as string) : "";
    const artifact_id = typeof body?.artifact_id === "string" ? (body.artifact_id as string) : null;

    if (!VIRAL_EVENT_TYPES.includes(type as ViralMetricEventType)) {
      return NextResponse.json(
        { error: "Validation failed", details: ["type is required"] },
        { status: 400 }
      );
    }

    // Fire-and-forget. Never block the response on metrics IO.
    void logViralEvent(type as ViralMetricEventType, { artifact_id });

    return NextResponse.json({ success: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: unknown }).status)
        : 400;

    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
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
