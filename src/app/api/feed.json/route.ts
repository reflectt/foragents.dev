import { NextRequest, NextResponse } from "next/server";
import { getNews } from "@/lib/data";

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag") ?? undefined;
  const items = getNews(tag);

  return NextResponse.json(
    { items, count: items.length, updated_at: new Date().toISOString() },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
