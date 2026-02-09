import "server-only";

import { getSkills, type Skill } from "@/lib/data";
import { readCanaryScorecards } from "@/lib/server/canaryScorecardStore";

import { type NeedCategory, type UserType, isNeedCategory } from "@/lib/recommendationsShared";

export type Recommendation = {
  skill: Skill;
  score: number;
  reasons: string[];
  canaryPassRate?: number;
};

const CATEGORY_TO_TAGS: Record<NeedCategory, string[]> = {
  Memory: ["memory", "persistence", "notes", "obsidian", "knowledge"],
  Autonomy: ["autonomy", "proactive", "task-queue", "identity"],
  Communication: [
    "communication",
    "teams",
    "coordination",
    "distribution",
    "cross-posting",
    "gmail",
    "calendar",
    "twitter",
    "social-media",
    "posting",
  ],
  DevOps: ["devops", "github", "git", "issues", "pull-requests", "coding", "development"],
  Data: ["data", "databases", "sheets", "drive", "weather", "forecast", "summarization", "transcription"],
};

const USERTYPE_BOOST_TAGS: Record<UserType, string[]> = {
  agent: ["openclaw", "autonomy", "memory", "proactive", "task-queue", "coordination"],
  developer: ["coding", "development", "github", "git", "issues", "pull-requests", "codex", "claude-code"],
};

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function latestPassRateBySlug(scorecards: Awaited<ReturnType<typeof readCanaryScorecards>>): Map<string, number> {
  const best = new Map<string, { date: string; passRate: number }>();
  for (const s of scorecards) {
    const prev = best.get(s.agentId);
    if (!prev || s.date > prev.date) {
      best.set(s.agentId, { date: s.date, passRate: s.passRate });
    }
  }
  return new Map([...best.entries()].map(([slug, v]) => [slug, v.passRate] as const));
}

export async function getRecommendations(
  userType: UserType,
  categories: NeedCategory[],
  opts?: { limit?: number }
): Promise<Recommendation[]> {
  const limit = opts?.limit ?? 8;
  const normalizedCategories = categories.filter((c): c is NeedCategory => isNeedCategory(String(c)));

  const selectedTags = uniq(
    normalizedCategories.flatMap((c) => CATEGORY_TO_TAGS[c] ?? [])
  );

  const skills = getSkills();
  const scorecards = await readCanaryScorecards();
  const passRateBySlug = latestPassRateBySlug(scorecards);

  const boosts = new Set(USERTYPE_BOOST_TAGS[userType] ?? []);

  const scored = skills.map((skill) => {
    const reasons: string[] = [];
    let score = 0;

    // Category match.
    if (selectedTags.length > 0) {
      const matches = selectedTags.filter((t) => skill.tags?.includes(t));
      if (matches.length > 0) {
        score += matches.length * 15;
        reasons.push(`Matches your needs: ${matches.slice(0, 6).join(", ")}${matches.length > 6 ? "…" : ""}`);
      }
    }

    // User type bias.
    const boostMatches = (skill.tags ?? []).filter((t) => boosts.has(t));
    if (boostMatches.length > 0) {
      score += boostMatches.length * 5;
      reasons.push(`Good fit for ${userType === "agent" ? "agents" : "developers"}`);
    }

    // Verified > non-verified.
    if (skill.verified || skill.verification) {
      score += 40;
      reasons.push("Verified skill");
    }

    // Reliability (best-effort from canary scorecards).
    const passRate = passRateBySlug.get(skill.slug);
    if (typeof passRate === "number") {
      // Scale 0..1 → 0..30
      score += Math.round(passRate * 30);
      if (passRate >= 0.95) score += 10;
      reasons.push(`Canary reliability: ${(passRate * 100).toFixed(0)}%`);
    }

    // Small tie-breakers.
    if (skill.repo_url) score += 2;
    if ((skill.tags?.length ?? 0) >= 4) score += 1;

    return {
      skill,
      score,
      reasons: reasons.length ? reasons : ["Popular baseline recommendation"],
      canaryPassRate: passRate,
    } satisfies Recommendation;
  });

  // If no categories selected, still rank by verification + reliability.
  // (The category match portion will contribute 0.)
  scored.sort((a, b) => (b.score === a.score ? a.skill.slug.localeCompare(b.skill.slug) : b.score - a.score));

  return scored.slice(0, Math.max(1, limit));
}

export function categoryToTags(category: NeedCategory): string[] {
  return CATEGORY_TO_TAGS[category] ?? [];
}

export function allCategoryTags(): Record<NeedCategory, string[]> {
  return CATEGORY_TO_TAGS;
}
