import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";
import { NEED_CATEGORIES, type NeedCategory, type UserType, isNeedCategory } from "@/lib/recommendationsShared";

function parseUserType(raw: string | null): UserType {
  return raw === "developer" ? "developer" : "agent";
}

function parseCategories(input: URLSearchParams): NeedCategory[] {
  const out: NeedCategory[] = [];

  // Support repeated params (?category=Memory&category=Data)
  for (const v of input.getAll("category")) {
    if (isNeedCategory(v)) out.push(v);
  }

  // Support comma-separated (?categories=Memory,Data)
  const raw = input.get("categories");
  if (raw) {
    for (const piece of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
      if (isNeedCategory(piece)) out.push(piece);
    }
  }

  return [...new Set(out)];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userType = parseUserType(url.searchParams.get("userType"));
  const categories = parseCategories(url.searchParams);
  const limit = (() => {
    const raw = url.searchParams.get("limit");
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return 8;
    return Math.max(1, Math.min(24, Math.floor(n)));
  })();

  const recommendations = await getRecommendations(userType, categories, { limit });

  return NextResponse.json(
    {
      userType,
      categories,
      count: recommendations.length,
      updated_at: new Date().toISOString(),
      recommendations: recommendations.map((r) => ({
        slug: r.skill.slug,
        name: r.skill.name,
        description: r.skill.description,
        author: r.skill.author,
        install_cmd: r.skill.install_cmd,
        repo_url: r.skill.repo_url,
        tags: r.skill.tags,
        verified: !!(r.skill.verified || r.skill.verification),
        canaryPassRate: r.canaryPassRate ?? null,
        score: r.score,
        reasons: r.reasons,
      })),
    },
    {
      headers: {
        // Keep it snappy, but allow caching.
        "Cache-Control": "public, max-age=60",
      },
    }
  );
}
