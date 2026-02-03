#!/usr/bin/env npx tsx
/**
 * RSS Feed Ingestion Script for forAgents.dev
 * 
 * Fetches RSS/Atom feeds from verified sources, parses them into
 * our news_items format, deduplicates by URL, and writes to src/data/news.json.
 * 
 * Usage: npx tsx src/lib/ingest.ts
 */

import Parser from "rss-parser";
import * as fs from "fs";
import * as path from "path";
import { fetchColonyPosts } from "./colony";

// Types matching our existing data format
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
}

interface Source {
  name: string;
  url: string;
  feedUrl: string | null;
  type: string;
  category: string;
  updateFrequency: string;
  verified: boolean;
  notes: string;
}

interface SourcesFile {
  sources: Source[];
}

// Category → tags mapping
const CATEGORY_TAGS: Record<string, string[]> = {
  "ai-company-blog": ["models", "tools"],
  "ai-news": ["community", "agents"],
  "ai-community": ["community"],
  "ai-product": ["tools"],
};

// Source-specific tag overrides
const SOURCE_TAG_OVERRIDES: Record<string, string[]> = {
  "OpenAI Blog": ["models", "tools", "openai"],
  "Google DeepMind Blog": ["models", "research"],
  "Google AI Blog": ["models", "tools"],
  "Anthropic Blog": ["models", "tools", "agents"],
  "Meta Engineering (ML Applications)": ["models", "tools"],
  "Hacker News — AI/Agent Front Page": ["community", "agents"],
  "Hacker News — AI Agent (Newest)": ["community", "agents"],
  "r/MachineLearning": ["community", "models"],
  "r/artificial": ["community", "agents"],
  "r/LocalLLaMA": ["community", "models"],
  "r/AIAgents": ["community", "agents"],
  "r/Autonomous_Agents": ["community", "agents"],
  "OpenClaw GitHub Releases": ["tools", "openclaw"],
  "Claude Code GitHub Releases": ["tools", "agents"],
  "Product Hunt — AI Category": ["tools", "community"],
  "Product Hunt — All": ["tools"],
};

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "forAgents.dev/1.0 (RSS ingestion; https://foragents.dev)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
});

function generateId(url: string): string {
  // Simple hash from URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `feed-${Math.abs(hash).toString(36)}`;
}

function truncate(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchFeed(source: Source): Promise<NewsItem[]> {
  if (!source.feedUrl || !source.verified) return [];

  try {
    console.log(`  📡 Fetching: ${source.name}...`);
    const feed = await parser.parseURL(source.feedUrl);
    const items: NewsItem[] = [];

    const tags = SOURCE_TAG_OVERRIDES[source.name] || CATEGORY_TAGS[source.category] || ["community"];

    for (const entry of (feed.items || []).slice(0, 10)) {
      const url = entry.link || entry.guid || "";
      if (!url) continue;

      const title = stripHtml(entry.title || "Untitled");
      const summary = truncate(
        stripHtml(entry.contentSnippet || entry.content || entry.summary || entry["dc:description"] || ""),
        300
      );
      const pubDate = entry.pubDate || entry.isoDate || new Date().toISOString();

      items.push({
        id: generateId(url),
        title,
        summary: summary || `From ${source.name}`,
        source_url: url,
        source_name: source.name,
        tags,
        published_at: new Date(pubDate).toISOString(),
      });
    }

    console.log(`  ✅ ${source.name}: ${items.length} items`);
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ ${source.name}: ${msg}`);
    return [];
  }
}

async function main() {
  console.log("🔗 forAgents.dev — RSS Feed Ingestion");
  console.log("======================================\n");

  // Load sources
  const sourcesPath = path.resolve(__dirname, "../../data/sources.json");
  const sourcesFile: SourcesFile = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
  
  const verifiedSources = sourcesFile.sources.filter(
    (s) => s.verified && s.feedUrl
  );
  console.log(`Found ${verifiedSources.length} verified sources with feeds\n`);

  // Load existing news to preserve hand-curated items
  const newsPath = path.resolve(__dirname, "../../src/data/news.json");
  let existingNews: NewsItem[] = [];
  try {
    existingNews = JSON.parse(fs.readFileSync(newsPath, "utf-8"));
    console.log(`Existing news items: ${existingNews.length}\n`);
  } catch {
    console.log("No existing news file found, starting fresh\n");
  }

  // Fetch all feeds in parallel (with concurrency limit)
  const BATCH_SIZE = 5;
  const allFeedItems: NewsItem[] = [];

  for (let i = 0; i < verifiedSources.length; i += BATCH_SIZE) {
    const batch = verifiedSources.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchFeed));
    for (const items of results) {
      allFeedItems.push(...items);
    }
  }

  console.log(`\n📊 Fetched ${allFeedItems.length} total RSS feed items`);

  // Fetch from The Colony API
  console.log("\n🏘️  Fetching from API sources...");
  const colonyItems = await fetchColonyPosts();
  allFeedItems.push(...colonyItems);
  console.log(`📊 Total items (RSS + API): ${allFeedItems.length}`);

  // Deduplicate: existing items take priority (by URL)
  const seenUrls = new Set<string>();
  const mergedItems: NewsItem[] = [];

  // Keep all existing hand-curated items first
  for (const item of existingNews) {
    if (!seenUrls.has(item.source_url)) {
      seenUrls.add(item.source_url);
      mergedItems.push(item);
    }
  }

  // Add new feed items that aren't duplicates
  let newCount = 0;
  for (const item of allFeedItems) {
    if (!seenUrls.has(item.source_url)) {
      seenUrls.add(item.source_url);
      mergedItems.push(item);
      newCount++;
    }
  }

  // Sort by date, newest first
  mergedItems.sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  // Write output
  fs.writeFileSync(newsPath, JSON.stringify(mergedItems, null, 2));

  console.log(`\n✅ Done!`);
  console.log(`   Total items: ${mergedItems.length}`);
  console.log(`   New items added: ${newCount}`);
  console.log(`   Duplicates skipped: ${allFeedItems.length - newCount}`);
  console.log(`   Output: ${newsPath}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
