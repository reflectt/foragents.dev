import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type RoadmapStatus = "planned" | "in-progress" | "completed" | "shipped";
export type RoadmapCategory = "platform" | "tools" | "community" | "enterprise";

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  quarter: string;
  category: RoadmapCategory;
  votes: number;
  updatedAt: string;
  voters?: string[];
};

const ROADMAP_PATH = path.join(process.cwd(), "data", "roadmap.json");

const ROADMAP_STATUSES: RoadmapStatus[] = ["planned", "in-progress", "completed", "shipped"];
const ROADMAP_CATEGORIES: RoadmapCategory[] = ["platform", "tools", "community", "enterprise"];

export function isRoadmapStatus(value: string | null): value is RoadmapStatus {
  return value !== null && ROADMAP_STATUSES.includes(value as RoadmapStatus);
}

export function isRoadmapCategory(value: string | null): value is RoadmapCategory {
  return value !== null && ROADMAP_CATEGORIES.includes(value as RoadmapCategory);
}

function normalizeItem(item: Record<string, unknown>): RoadmapItem {
  const status = typeof item.status === "string" && isRoadmapStatus(item.status) ? item.status : "planned";
  const category =
    typeof item.category === "string" && isRoadmapCategory(item.category) ? item.category : "platform";

  const votesFromVotes = typeof item.votes === "number" ? item.votes : undefined;
  const votesFromLegacy = typeof item.voteCount === "number" ? item.voteCount : 0;

  return {
    id: typeof item.id === "string" ? item.id : createRoadmapId(String(item.title ?? "feature-request")),
    title: typeof item.title === "string" ? item.title : "Untitled roadmap item",
    description: typeof item.description === "string" ? item.description : "",
    status,
    quarter: typeof item.quarter === "string" ? item.quarter : "Backlog",
    category,
    votes: votesFromVotes ?? votesFromLegacy,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
    voters: Array.isArray(item.voters)
      ? item.voters.filter((value): value is string => typeof value === "string")
      : [],
  };
}

export async function readRoadmapItems(): Promise<RoadmapItem[]> {
  const raw = await fs.readFile(ROADMAP_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((entry) => normalizeItem((entry ?? {}) as Record<string, unknown>));
}

export async function writeRoadmapItems(items: RoadmapItem[]): Promise<void> {
  await fs.writeFile(ROADMAP_PATH, `${JSON.stringify(items, null, 2)}\n`, "utf-8");
}

export function createRoadmapId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${slug || "feature-request"}-${Date.now()}`;
}

export function filterRoadmapItems(
  items: RoadmapItem[],
  options: { status?: RoadmapStatus; category?: RoadmapCategory; search?: string }
): RoadmapItem[] {
  const searchQuery = options.search?.trim().toLowerCase();

  return items.filter((item) => {
    if (options.status && item.status !== options.status) {
      return false;
    }

    if (options.category && item.category !== options.category) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const haystack = `${item.title} ${item.description} ${item.category} ${item.quarter}`.toLowerCase();
    return haystack.includes(searchQuery);
  });
}
