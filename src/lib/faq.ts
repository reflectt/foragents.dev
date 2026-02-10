import { promises as fs } from "node:fs";
import path from "node:path";

export const FAQ_CATEGORIES = [
  "getting-started",
  "billing",
  "technical",
  "integrations",
  "security",
  "general",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  tags: string[];
  updatedAt: string;
  helpful: number;
};

export type FaqSubmission = {
  id: string;
  question: string;
  category: FaqCategory;
  email?: string;
  createdAt: string;
};

export type FaqData = {
  faqs: FaqItem[];
  submissions: FaqSubmission[];
};

export type FaqFilters = {
  category?: string | null;
  search?: string | null;
};

const FAQ_PATH = path.join(process.cwd(), "data", "faq.json");

export function isFaqCategory(value: unknown): value is FaqCategory {
  return typeof value === "string" && FAQ_CATEGORIES.includes(value as FaqCategory);
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function sanitizeFaqItem(value: unknown): FaqItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const faq = value as Record<string, unknown>;

  if (
    typeof faq.id !== "string" ||
    typeof faq.question !== "string" ||
    typeof faq.answer !== "string" ||
    !isFaqCategory(faq.category)
  ) {
    return null;
  }

  const tags = normalizeTags(faq.tags);

  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    tags,
    updatedAt: isValidDate(faq.updatedAt) ? faq.updatedAt : new Date().toISOString(),
    helpful: typeof faq.helpful === "number" ? faq.helpful : 0,
  };
}

function sanitizeFaqSubmission(value: unknown): FaqSubmission | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const submission = value as Record<string, unknown>;

  if (
    typeof submission.id !== "string" ||
    typeof submission.question !== "string" ||
    !isFaqCategory(submission.category)
  ) {
    return null;
  }

  return {
    id: submission.id,
    question: submission.question,
    category: submission.category,
    email: typeof submission.email === "string" ? submission.email : undefined,
    createdAt: isValidDate(submission.createdAt) ? submission.createdAt : new Date().toISOString(),
  };
}

export async function readFaqData(): Promise<FaqData> {
  try {
    const raw = await fs.readFile(FAQ_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { faqs: [], submissions: [] };
    }

    const data = parsed as Record<string, unknown>;
    const faqsRaw = Array.isArray(data.faqs) ? data.faqs : [];
    const submissionsRaw = Array.isArray(data.submissions) ? data.submissions : [];

    return {
      faqs: faqsRaw
        .map((entry) => sanitizeFaqItem(entry))
        .filter((entry): entry is FaqItem => entry !== null),
      submissions: submissionsRaw
        .map((entry) => sanitizeFaqSubmission(entry))
        .filter((entry): entry is FaqSubmission => entry !== null),
    };
  } catch {
    return { faqs: [], submissions: [] };
  }
}

export async function writeFaqData(data: FaqData): Promise<void> {
  await fs.mkdir(path.dirname(FAQ_PATH), { recursive: true });
  await fs.writeFile(FAQ_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export function filterFaqs(faqs: FaqItem[], filters: FaqFilters): FaqItem[] {
  const category = filters.category?.trim().toLowerCase() ?? "";
  const search = filters.search?.trim().toLowerCase() ?? "";

  return faqs.filter((faq) => {
    if (category && category !== "all" && faq.category !== category) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [faq.question, faq.answer, faq.tags.join(" ")].join(" ").toLowerCase();
    return haystack.includes(search);
  });
}

export async function createFaqEntry(
  input: Partial<FaqItem>
): Promise<{ faq?: FaqItem; errors: string[] }> {
  const errors: string[] = [];

  const question = typeof input.question === "string" ? input.question.trim() : "";
  const answer = typeof input.answer === "string" ? input.answer.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim().toLowerCase() : "";

  const tags = normalizeTags(input.tags);

  if (!question) errors.push("question is required");
  if (!answer) errors.push("answer is required");
  if (!isFaqCategory(category)) {
    errors.push(`category must be one of: ${FAQ_CATEGORIES.join(", ")}`);
  }
  if (tags.length === 0) errors.push("tags must include at least one value");

  if (errors.length > 0) {
    return { errors };
  }

  const data = await readFaqData();
  const faq: FaqItem = {
    id: typeof input.id === "string" && input.id.trim() ? input.id.trim() : `faq-${Date.now()}`,
    question,
    answer,
    category: category as FaqCategory,
    tags,
    updatedAt: new Date().toISOString(),
    helpful: typeof input.helpful === "number" ? input.helpful : 0,
  };

  await writeFaqData({
    ...data,
    faqs: [faq, ...data.faqs],
  });

  return { faq, errors: [] };
}

export async function createFaqSubmission(input: {
  question?: unknown;
  category?: unknown;
  email?: unknown;
}): Promise<{ submission?: FaqSubmission; errors: string[] }> {
  const errors: string[] = [];

  const question = typeof input.question === "string" ? input.question.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim().toLowerCase() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";

  if (!question || question.length < 10) {
    errors.push("question is required and must be at least 10 characters");
  }

  if (!isFaqCategory(category)) {
    errors.push(`category must be one of: ${FAQ_CATEGORIES.join(", ")}`);
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("email must be valid");
  }

  if (errors.length > 0) {
    return { errors };
  }

  const data = await readFaqData();

  const submission: FaqSubmission = {
    id: `question_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question,
    category: category as FaqCategory,
    email: email || undefined,
    createdAt: new Date().toISOString(),
  };

  await writeFaqData({
    ...data,
    submissions: [...data.submissions, submission],
  });

  return { submission, errors: [] };
}

export async function incrementFaqHelpful(
  id: string
): Promise<{ faq?: FaqItem; error?: "missing-id" | "not-found" }> {
  const faqId = id.trim();

  if (!faqId) {
    return { error: "missing-id" };
  }

  const data = await readFaqData();
  const index = data.faqs.findIndex((faq) => faq.id === faqId);

  if (index < 0) {
    return { error: "not-found" };
  }

  const faq = {
    ...data.faqs[index],
    helpful: data.faqs[index].helpful + 1,
    updatedAt: new Date().toISOString(),
  };

  data.faqs[index] = faq;
  await writeFaqData(data);

  return { faq };
}
