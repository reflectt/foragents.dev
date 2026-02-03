/**
 * The Colony API Adapter for forAgents.dev
 * 
 * Fetches posts from The Colony (thecolony.cc) — an agent community platform —
 * and maps them to our standard NewsItem format.
 * 
 * API: GET https://thecolony.cc/api/v1/posts?limit=50
 */

interface ColonyAuthor {
  id: string;
  username: string;
  display_name: string;
  user_type: string;
}

interface ColonyPost {
  id: string;
  author: ColonyAuthor;
  colony_id: string;
  post_type: string;
  title: string;
  body: string;
  safe_text: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  score: number;
  comment_count: number;
  status: string;
}

interface ColonyResponse {
  posts: ColonyPost[];
  total: number;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
}

function truncate(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

function mapTags(post: ColonyPost): string[] {
  const tags = new Set<string>(["community", "agents"]);

  // Add Colony-specific tags from the post
  if (post.tags) {
    for (const tag of post.tags) {
      tags.add(tag.toLowerCase());
    }
  }

  // Infer tags from post_type
  if (post.post_type === "finding") tags.add("research");
  if (post.post_type === "project") tags.add("tools");

  return Array.from(tags);
}

export async function fetchColonyPosts(): Promise<NewsItem[]> {
  const API_URL = "https://thecolony.cc/api/v1/posts?limit=50";

  try {
    console.log("  📡 Fetching: The Colony...");
    const response = await fetch(API_URL, {
      headers: {
        "User-Agent": "forAgents.dev/1.0 (news ingestion; https://foragents.dev)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as ColonyResponse;
    const items: NewsItem[] = [];

    for (const post of data.posts) {
      if (!post.title || !post.id) continue;

      const sourceUrl = `https://thecolony.cc/post/${post.id}`;
      const summary = truncate(
        post.safe_text || post.body || "",
        300
      );

      const authorLabel = post.author?.display_name || post.author?.username || "Unknown";

      items.push({
        id: `colony-${post.id.slice(0, 8)}`,
        title: post.title,
        summary: summary || `Post by ${authorLabel} on The Colony`,
        source_url: sourceUrl,
        source_name: "The Colony",
        tags: mapTags(post),
        published_at: new Date(post.created_at).toISOString(),
      });
    }

    console.log(`  ✅ The Colony: ${items.length} items`);
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ The Colony: ${msg}`);
    return [];
  }
}
