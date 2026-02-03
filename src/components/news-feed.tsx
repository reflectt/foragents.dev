"use client";

import { useState, useMemo } from "react";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
};

type SortMode = "newest" | "trending";
type SourceFilter = "all" | "rss" | "colony";

// Colony source names
const COLONY_SOURCES = new Set(["The Colony"]);

// High-signal sources that contribute to "HOT" scoring
const HIGH_SIGNAL_SOURCES = new Set([
  "Hacker News — AI/Agent Front Page",
  "OpenAI Blog",
  "Google AI Blog",
  "Google DeepMind Blog",
  "OpenClaw GitHub Releases",
  "Claude Code GitHub Releases",
]);

const categoryColors: Record<string, { bg: string; text: string }> = {
  tools:     { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]" },
  skills:    { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
  models:    { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]" },
  community: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]" },
  breaking:  { bg: "bg-[#EC4899]/10", text: "text-[#EC4899]" },
};

const tagColors: Record<string, string> = {
  breaking: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20",
  security: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  openclaw: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  community: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  tools: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  skills: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  enterprise: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  models: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  standards: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  trends: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  milestone: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  funding: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  partnerships: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  analysis: "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20",
  moltbook: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  mcp: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getCategoryFromTags(tags: string[]): string {
  if (tags.includes("breaking")) return "breaking";
  if (tags.includes("tools") || tags.includes("mcp")) return "tools";
  if (tags.includes("models")) return "models";
  if (tags.includes("skills")) return "skills";
  if (tags.includes("community")) return "community";
  return tags[0] || "tools";
}

function isNew(item: NewsItem): boolean {
  const age = Date.now() - new Date(item.published_at).getTime();
  return age < 24 * 60 * 60 * 1000;
}

function isHot(item: NewsItem): boolean {
  // HOT = from high-signal source, or breaking tag, or Colony post with high engagement signal
  if (item.tags.includes("breaking")) return true;
  if (HIGH_SIGNAL_SOURCES.has(item.source_name)) return true;
  return false;
}

function trendingScore(item: NewsItem): number {
  const ageMs = Date.now() - new Date(item.published_at).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // Base: recency (exponential decay over 48h)
  let score = Math.max(0, 1 - ageHours / 48);

  // Boost for high-signal sources
  if (HIGH_SIGNAL_SOURCES.has(item.source_name)) score += 0.4;

  // Boost for breaking
  if (item.tags.includes("breaking")) score += 0.6;

  // Boost for Colony (community signal)
  if (COLONY_SOURCES.has(item.source_name)) score += 0.2;

  // Small boost for <6h items
  if (ageHours < 6) score += 0.3;

  return score;
}

function isColony(item: NewsItem): boolean {
  return COLONY_SOURCES.has(item.source_name);
}

export function NewsFeed({ items }: { items: NewsItem[] }) {
  const [sort, setSort] = useState<SortMode>("newest");
  const [filter, setFilter] = useState<SourceFilter>("all");

  const filtered = useMemo(() => {
    let result = [...items];

    // Apply source filter
    if (filter === "colony") {
      result = result.filter((item) => isColony(item));
    } else if (filter === "rss") {
      result = result.filter((item) => !isColony(item));
    }

    // Apply sort
    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      );
    } else {
      result.sort((a, b) => trendingScore(b) - trendingScore(a));
    }

    return result;
  }, [items, sort, filter]);

  const colonyCount = items.filter(isColony).length;
  const rssCount = items.length - colonyCount;

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        {/* Source filter */}
        <div className="flex items-center gap-1 rounded-lg bg-card/50 border border-white/5 p-1">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
            <span className="text-muted-foreground ml-1 text-[11px]">
              {items.length}
            </span>
          </FilterButton>
          <FilterButton
            active={filter === "rss"}
            onClick={() => setFilter("rss")}
          >
            📡 RSS
            <span className="text-muted-foreground ml-1 text-[11px]">
              {rssCount}
            </span>
          </FilterButton>
          <FilterButton
            active={filter === "colony"}
            onClick={() => setFilter("colony")}
          >
            🏠 Colony
            <span className="text-muted-foreground ml-1 text-[11px]">
              {colonyCount}
            </span>
          </FilterButton>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-1 rounded-lg bg-card/50 border border-white/5 p-1">
          <SortButton active={sort === "newest"} onClick={() => setSort("newest")}>
            🕐 Newest
          </SortButton>
          <SortButton
            active={sort === "trending"}
            onClick={() => setSort("trending")}
          >
            🔥 Trending
          </SortButton>
        </div>
      </div>

      {/* Feed items */}
      <div className="grid gap-3">
        {filtered.map((item) => {
          const category = getCategoryFromTags(item.tags);
          const catStyle = categoryColors[category] || categoryColors.tools;
          const isBreaking = item.tags.includes("breaking");
          const itemIsNew = isNew(item);
          const itemIsHot = isHot(item);
          const itemIsColony = isColony(item);

          return (
            <a
              key={item.id}
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block rounded-xl border bg-card/50 p-5 transition-all duration-200 hover:border-[#2A3040] hover:shadow-[0_0_20px_rgba(6,214,160,0.05)] group ${
                isBreaking
                  ? "border-l-[3px] border-l-aurora-pink border-[#1A1F2E]"
                  : "border-[#1A1F2E]"
              }`}
            >
              {/* Meta row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${catStyle.text}`}
                  >
                    {category}
                  </span>
                  <span className="text-muted-foreground text-[13px]">·</span>
                  <span className="text-muted-foreground text-[13px]">
                    {itemIsColony && (
                      <span className="inline-flex items-center gap-1 text-[#F59E0B]">
                        🏠{" "}
                      </span>
                    )}
                    {item.source_name}
                  </span>

                  {/* Badges */}
                  {itemIsNew && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#06D6A0]/15 text-[#06D6A0] border border-[#06D6A0]/25">
                      NEW
                    </span>
                  )}
                  {itemIsHot && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EC4899]/15 text-[#EC4899] border border-[#EC4899]/25">
                      🔥 HOT
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-[13px] shrink-0 ml-2">
                  {timeAgo(item.published_at)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-[#F8FAFC] leading-tight group-hover:text-cyan transition-colors line-clamp-2 mb-2">
                {item.title}
              </h3>

              {/* Summary */}
              <p className="text-[15px] text-foreground/80 leading-relaxed line-clamp-3 mb-4">
                {item.summary}
              </p>

              {/* Footer: tags + source */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={`inline-block font-mono text-[11px] uppercase tracking-[0.08em] px-2 py-1 rounded-md ${
                        tagColors[tag] ||
                        "bg-white/5 text-white/60 border border-white/10"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-muted-foreground text-[13px] group-hover:text-cyan transition-colors">
                  ↗ Source
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No articles found</p>
          <p className="text-sm mt-1">Try a different filter</p>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        active
          ? "bg-white/10 text-[#F8FAFC]"
          : "text-muted-foreground hover:text-[#F8FAFC] hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        active
          ? "bg-cyan/15 text-cyan"
          : "text-muted-foreground hover:text-[#F8FAFC] hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
