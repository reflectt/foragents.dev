import { NextResponse } from "next/server";

import { SHARE_LINKS } from "@/lib/shareLinks";

/**
 * GET /api/share.json
 *
 * Copy/paste helper for canonical agent-shareable links.
 */
export async function GET() {
  return NextResponse.json(
    {
      share: SHARE_LINKS,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    }
  );
}
