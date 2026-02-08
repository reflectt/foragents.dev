/**
 * Daily Digest - Data aggregation for Premium subscribers
 *
 * Provides functions to aggregate news, skills, and MCP servers
 * for the daily digest email feature.
 */

import { getNews, getSkills, getMcpServers } from "./data";

export type DigestNewsItem = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
};

export type DigestSkill = {
  slug: string;
  name: string;
  description: string;
  author: string;
  repo_url: string;
  tags: string[];
};

export type DigestMcpServer = {
  slug: string;
  name: string;
  description: string;
  github: string;
  author: string;
  category: string;
  tags: string[];
  trendingScore?: number;
};

export type DailyDigest = {
  generated_at: string;
  period: {
    start: string;
    end: string;
  };
  news: {
    items: DigestNewsItem[];
    total_count: number;
  };
  skills: {
    items: DigestSkill[];
    total_count: number;
  };
  mcp_servers: {
    trending: DigestMcpServer[];
    total_count: number;
  };
};

/**
 * Get top news items from the last N hours
 * @param limit - Maximum number of items to return
 * @param since - ISO date string or Date to filter from
 */
export function getTopNews(
  limit: number = 10,
  since?: string | Date
): DigestNewsItem[] {
  const allNews = getNews();

  // Default to last 24 hours if no since provided
  const sinceDate = since
    ? new Date(since)
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentNews = allNews
    .filter((item) => new Date(item.published_at) >= sinceDate)
    .slice(0, limit);

  return recentNews.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    source_url: item.source_url,
    source_name: item.source_name,
    tags: item.tags,
    published_at: item.published_at,
  }));
}

/**
 * Get newest skills
 *
 * Note: Skills don't currently have a created_at field,
 * so we return the first N skills (assumed to be ordered by recency
 * or will be enhanced later with proper timestamps).
 *
 * @param limit - Maximum number of skills to return
 */
export function getNewSkills(limit: number = 3): DigestSkill[] {
  const allSkills = getSkills();

  // TODO: Once skills have a created_at field, filter by date
  // For now, return the first N skills (they're likely the newest)
  const skills = allSkills.slice(0, limit);

  return skills.map((skill) => ({
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    author: skill.author,
    repo_url: skill.repo_url,
    tags: skill.tags,
  }));
}

/**
 * Get trending MCP servers
 *
 * Trending is determined by:
 * 1. Official servers from Anthropic get a boost
 * 2. Servers with more tags (typically more feature-rich) rank higher
 * 3. Category diversity is maintained
 *
 * In the future, this could be enhanced with actual usage metrics.
 *
 * @param limit - Maximum number of servers to return
 */
export function getTrendingMCP(limit: number = 5): DigestMcpServer[] {
  const allServers = getMcpServers();

  // Calculate a basic trending score
  const scored = allServers.map((server) => {
    let score = 0;

    // Official servers get a boost
    if (server.author === "Anthropic" || server.tags.includes("official")) {
      score += 10;
    }

    // More tags = likely more features = more interesting
    score += server.tags.length * 2;

    // Certain popular categories get a small boost
    const popularCategories = ["web", "dev-tools", "productivity", "ai-integration"];
    if (popularCategories.includes(server.category)) {
      score += 3;
    }

    return { ...server, trendingScore: score };
  });

  // Sort by score descending
  scored.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0));

  // Take top N and format for digest
  return scored.slice(0, limit).map((server) => ({
    slug: server.slug,
    name: server.name,
    description: server.description,
    github: server.github,
    author: server.author,
    category: server.category,
    tags: server.tags,
    trendingScore: server.trendingScore,
  }));
}

/**
 * Generate the complete daily digest
 *
 * Aggregates all data sources into a single digest object
 * suitable for rendering as JSON or converting to email template.
 */
export function generateDailyDigest(): DailyDigest {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const newsItems = getTopNews(10, yesterday);
  const newSkills = getNewSkills(3);
  const trendingMcp = getTrendingMCP(5);

  // Get totals for context
  const allNews = getNews();
  const allSkills = getSkills();
  const allServers = getMcpServers();

  return {
    generated_at: now.toISOString(),
    period: {
      start: yesterday.toISOString(),
      end: now.toISOString(),
    },
    news: {
      items: newsItems,
      total_count: allNews.length,
    },
    skills: {
      items: newSkills,
      total_count: allSkills.length,
    },
    mcp_servers: {
      trending: trendingMcp,
      total_count: allServers.length,
    },
  };
}

/**
 * Convert digest to markdown (for email or display)
 */
export function digestToMarkdown(digest: DailyDigest): string {
  const lines: string[] = [];

  lines.push("# 📰 forAgents.dev Daily Digest");
  lines.push("");
  lines.push(`> Generated: ${new Date(digest.generated_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`);
  lines.push("");

  // News section
  lines.push("## 🗞️ Top News");
  lines.push("");
  if (digest.news.items.length === 0) {
    lines.push("*No new articles in the last 24 hours.*");
  } else {
    for (const item of digest.news.items) {
      lines.push(`### ${item.title}`);
      lines.push("");
      lines.push(item.summary.slice(0, 200) + (item.summary.length > 200 ? "..." : ""));
      lines.push("");
      lines.push(`[Read more →](${item.source_url}) · ${item.source_name}`);
      lines.push("");
    }
  }

  // Skills section
  lines.push("## 🛠️ New Skills");
  lines.push("");
  if (digest.skills.items.length === 0) {
    lines.push("*No new skills this period.*");
  } else {
    for (const skill of digest.skills.items) {
      lines.push(`### ${skill.name}`);
      lines.push("");
      lines.push(skill.description.slice(0, 150) + (skill.description.length > 150 ? "..." : ""));
      lines.push("");
      lines.push(`By ${skill.author} · [View Skill](${skill.repo_url})`);
      lines.push("");
    }
  }

  // MCP section
  lines.push("## 🔌 Trending MCP Servers");
  lines.push("");
  for (const server of digest.mcp_servers.trending) {
    lines.push(`### ${server.name}`);
    lines.push("");
    lines.push(server.description.slice(0, 150) + (server.description.length > 150 ? "..." : ""));
    lines.push("");
    lines.push(`By ${server.author} · ${server.category} · [GitHub](${server.github})`);
    lines.push("");
  }

  // Footer
  lines.push("---");
  lines.push("");
  lines.push(`*Total indexed: ${digest.news.total_count} news articles · ${digest.skills.total_count} skills · ${digest.mcp_servers.total_count} MCP servers*`);
  lines.push("");
  lines.push("[Unsubscribe](#) · [Preferences](#) · [forAgents.dev](https://forAgents.dev)");

  return lines.join("\n");
}
