import { promises as fs } from "fs";
import path from "path";

export type UseCaseIndustry =
  | "devops"
  | "customer-support"
  | "data-analysis"
  | "content-creation"
  | "security"
  | "automation";

export type UseCaseDifficulty = "beginner" | "intermediate" | "advanced";

export type UseCaseEntry = {
  id: string;
  title: string;
  description: string;
  industry: UseCaseIndustry;
  difficulty: UseCaseDifficulty;
  skills: string[];
  tags: string[];
  updatedAt: string;
};

type UseCaseSubmission = {
  title?: unknown;
  description?: unknown;
  industry?: unknown;
  difficulty?: unknown;
  skills?: unknown;
  tags?: unknown;
};

const USE_CASES_PATH = path.join(process.cwd(), "data", "use-cases.json");

export const USE_CASE_INDUSTRIES: UseCaseIndustry[] = [
  "devops",
  "customer-support",
  "data-analysis",
  "content-creation",
  "security",
  "automation",
];

export const USE_CASE_DIFFICULTIES: UseCaseDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function isUseCaseEntry(value: unknown): value is UseCaseEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<UseCaseEntry>;

  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.industry === "string" &&
    USE_CASE_INDUSTRIES.includes(entry.industry as UseCaseIndustry) &&
    typeof entry.difficulty === "string" &&
    USE_CASE_DIFFICULTIES.includes(entry.difficulty as UseCaseDifficulty) &&
    Array.isArray(entry.skills) &&
    entry.skills.every((skill) => typeof skill === "string") &&
    Array.isArray(entry.tags) &&
    entry.tags.every((tag) => typeof tag === "string") &&
    typeof entry.updatedAt === "string"
  );
}

export async function readUseCases(): Promise<UseCaseEntry[]> {
  try {
    const raw = await fs.readFile(USE_CASES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry): entry is UseCaseEntry => isUseCaseEntry(entry))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export async function writeUseCases(useCases: UseCaseEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(USE_CASES_PATH), { recursive: true });
  await fs.writeFile(USE_CASES_PATH, JSON.stringify(useCases, null, 2));
}

export function filterUseCases(
  useCases: UseCaseEntry[],
  filters: {
    industry?: string | null;
    search?: string | null;
  }
): UseCaseEntry[] {
  const normalizedIndustry = filters.industry?.trim().toLowerCase() || "";
  const normalizedSearch = filters.search?.trim().toLowerCase() || "";

  return useCases.filter((entry) => {
    const industryMatch =
      !normalizedIndustry ||
      normalizedIndustry === "all" ||
      entry.industry.toLowerCase() === normalizedIndustry;

    if (!industryMatch) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      entry.title,
      entry.description,
      entry.industry,
      entry.difficulty,
      entry.skills.join(" "),
      entry.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

export function validateUseCaseSubmission(input: UseCaseSubmission): {
  errors: string[];
  payload?: {
    title: string;
    description: string;
    industry: UseCaseIndustry;
    difficulty: UseCaseDifficulty;
    skills: string[];
    tags: string[];
  };
} {
  const errors: string[] = [];

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const industry = typeof input.industry === "string" ? input.industry.trim().toLowerCase() : "";
  const difficulty =
    typeof input.difficulty === "string" ? input.difficulty.trim().toLowerCase() : "";
  const skills = normalizeStringArray(input.skills);
  const tags = normalizeStringArray(input.tags);

  if (!title) errors.push("title is required");
  if (!description) errors.push("description is required");

  if (!industry || !USE_CASE_INDUSTRIES.includes(industry as UseCaseIndustry)) {
    errors.push(`industry must be one of: ${USE_CASE_INDUSTRIES.join(", ")}`);
  }

  if (!difficulty || !USE_CASE_DIFFICULTIES.includes(difficulty as UseCaseDifficulty)) {
    errors.push(`difficulty must be one of: ${USE_CASE_DIFFICULTIES.join(", ")}`);
  }

  if (skills.length === 0) {
    errors.push("skills must include at least one skill");
  }

  if (tags.length === 0) {
    errors.push("tags must include at least one tag");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    payload: {
      title,
      description,
      industry: industry as UseCaseIndustry,
      difficulty: difficulty as UseCaseDifficulty,
      skills,
      tags,
    },
  };
}

export async function createUseCase(input: UseCaseSubmission): Promise<{
  errors: string[];
  useCase?: UseCaseEntry;
}> {
  const validation = validateUseCaseSubmission(input);
  if (validation.errors.length > 0 || !validation.payload) {
    return { errors: validation.errors };
  }

  const useCases = await readUseCases();

  const useCase: UseCaseEntry = {
    id: `usecase_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...validation.payload,
    updatedAt: new Date().toISOString(),
  };

  await writeUseCases([useCase, ...useCases]);

  return {
    errors: [],
    useCase,
  };
}
