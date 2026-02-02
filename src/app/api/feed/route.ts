import { NextRequest, NextResponse } from "next/server";
import { getNews, newsToMarkdown } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tag = searchParams.get("tag") ?? undefined;
  const format = searchParams.get("format");

  const items = getNews(tag);

  // If ?format=md or Accept header prefers text/markdown
  const acceptsMd =
    format === "md" ||
    request.headers.get("accept")?.includes("text/markdown");

  if (acceptsMd) {
    return new NextResponse(newsToMarkdown(items), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  return NextResponse.json(
    { items, count: items.length, updated_at: new Date().toISOString() },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
