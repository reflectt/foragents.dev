import { NextRequest, NextResponse } from "next/server";
import {
  getNews,
  getSkills,
  getMcpServers,
  getAgents,
  getAcpAgents,
  getLlmsTxtEntries,
  type NewsItem,
  type Skill,
  type McpServer,
  type Agent,
  type AcpAgent,
  type LlmsTxtEntry,
} from "@/lib/data";

/**
 * Score how well an item matches a query.
 * Returns 0 for no match, higher = more relevant.
 * - Exact name match: 100
 * - Name contains query: 50
 * - Tags/category exact match: 30
 * - Description contains query: 10
 * - Multiple term matches boost score
 */
function score(query: string, ...fields: { value: string | string[]; weight: number }[]): number {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  let total = 0;

  for (const field of fields) {
    const values = Array.isArray(field.value) ? field.value : [field.value];
    for (const v of values) {
      if (!v) continue;
      const lower = v.toLowerCase();
      if (lower === q) {
        total += field.weight * 10; // exact match
      } else if (lower.includes(q)) {
        total += field.weight * 5; // full query substring
      } else {
        // partial term matching
        for (const term of terms) {
          if (lower.includes(term)) {
            total += field.weight;
          }
        }
      }
    }
  }

  return total;
}

function scored<T>(items: T[], query: string, scorer: (item: T) => number): T[] {
  return items
    .map((item) => ({ item, score: scorer(item) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

export type SearchResults = {
  query: string;
  news: NewsItem[];
  skills: Skill[];
  mcpServers: McpServer[];
  agents: Agent[];
  acpAgents: AcpAgent[];
  llmsTxtSites: LlmsTxtEntry[];
  total: number;
};

export function search(query: string): SearchResults {
  const news = scored(getNews(), query, (n) =>
    score(query,
      { value: n.title, weight: 10 },
      { value: n.tags, weight: 8 },
      { value: n.summary, weight: 3 },
    )
  );

  const skills = scored(getSkills(), query, (s) =>
    score(query,
      { value: s.name, weight: 10 },
      { value: s.tags, weight: 8 },
      { value: s.description, weight: 3 },
    )
  );

  const mcpServers = scored(getMcpServers(), query, (m) =>
    score(query,
      { value: m.name, weight: 10 },
      { value: m.category, weight: 8 },
      { value: m.tags, weight: 8 },
      { value: m.description, weight: 3 },
    )
  );

  const agents = scored(getAgents(), query, (a) =>
    score(query,
      { value: a.name, weight: 10 },
      { value: a.role, weight: 6 },
      { value: a.skills, weight: 6 },
      { value: a.description, weight: 3 },
    )
  );

  const acpAgents = scored(getAcpAgents(), query, (a) =>
    score(query,
      { value: a.name, weight: 10 },
      { value: a.category, weight: 8 },
      { value: a.tags, weight: 8 },
      { value: a.description, weight: 3 },
    )
  );

  const llmsTxtSites = scored(getLlmsTxtEntries(), query, (l) =>
    score(query,
      { value: l.title, weight: 10 },
      { value: l.domain, weight: 8 },
      { value: l.sections, weight: 6 },
      { value: l.description, weight: 3 },
    )
  );

  return {
    query,
    news,
    skills,
    mcpServers,
    agents,
    acpAgents,
    llmsTxtSites,
    total: news.length + skills.length + mcpServers.length + agents.length + acpAgents.length + llmsTxtSites.length,
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  const results = search(q);

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
