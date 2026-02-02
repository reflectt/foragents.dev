import { NextRequest, NextResponse } from "next/server";
import {
  generateDailyDigest,
  digestToMarkdown,
  getTopNews,
  getNewSkills,
  getTrendingMCP,
} from "@/lib/digest";

/**
 * GET /api/digest
 *
 * Returns the daily digest data for Premium subscribers.
 *
 * Query params:
 *   - format: "md" for markdown output (default: JSON)
 *   - news_limit: Number of news items (default: 10)
 *   - skills_limit: Number of skills (default: 3)
 *   - mcp_limit: Number of MCP servers (default: 5)
 *   - hours: Hours to look back for news (default: 24)
 *
 * Examples:
 *   GET /api/digest                    → Full digest as JSON
 *   GET /api/digest?format=md          → Full digest as Markdown
 *   GET /api/digest?news_limit=5       → Digest with only 5 news items
 *   GET /api/digest?hours=48           → News from last 48 hours
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Parse query params
  const format = searchParams.get("format");
  const newsLimit = parseInt(searchParams.get("news_limit") ?? "10", 10);
  const skillsLimit = parseInt(searchParams.get("skills_limit") ?? "3", 10);
  const mcpLimit = parseInt(searchParams.get("mcp_limit") ?? "5", 10);
  const hours = parseInt(searchParams.get("hours") ?? "24", 10);

  // Calculate the since date based on hours
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Check if requesting full digest or custom
  const isCustom =
    searchParams.has("news_limit") ||
    searchParams.has("skills_limit") ||
    searchParams.has("mcp_limit") ||
    searchParams.has("hours");

  // Check Accept header for markdown preference
  const acceptsMd =
    format === "md" ||
    request.headers.get("accept")?.includes("text/markdown");

  // Generate digest
  let digest;

  if (isCustom) {
    // Custom query with specific limits
    const news = getTopNews(newsLimit, since);
    const skills = getNewSkills(skillsLimit);
    const trending = getTrendingMCP(mcpLimit);

    digest = {
      generated_at: new Date().toISOString(),
      period: {
        start: since.toISOString(),
        end: new Date().toISOString(),
        hours,
      },
      news: {
        items: news,
        count: news.length,
      },
      skills: {
        items: skills,
        count: skills.length,
      },
      mcp_servers: {
        trending,
        count: trending.length,
      },
    };
  } else {
    // Standard 24h digest
    digest = generateDailyDigest();
  }

  // Return markdown if requested
  if (acceptsMd) {
    const fullDigest = isCustom ? generateDailyDigest() : digest;
    const markdown = digestToMarkdown(fullDigest as ReturnType<typeof generateDailyDigest>);

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300", // 5 minute cache
      },
    });
  }

  // Return JSON
  return NextResponse.json(digest, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
