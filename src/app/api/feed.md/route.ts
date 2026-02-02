import { NextRequest, NextResponse } from "next/server";
import { getNews, newsToMarkdown } from "@/lib/data";

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag") ?? undefined;
  const items = getNews(tag);

  return new NextResponse(newsToMarkdown(items), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
