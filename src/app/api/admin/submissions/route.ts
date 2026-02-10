import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

type SubmissionType = "contact" | "partner" | "contributor" | "kit-request" | "glossary";
type SubmissionStatus = "new" | "reviewed" | "archived";

type JsonRecord = Record<string, unknown>;

type NormalizedSubmission = {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  submittedAt: string;
  title: string;
  summary: string;
  submitter: string;
  email?: string;
  sourceFile: string;
  data: JsonRecord;
};

type SourceConfig = {
  type: SubmissionType;
  fileName: string;
  extractItems: (raw: unknown) => JsonRecord[];
  putItems: (raw: unknown, nextItems: JsonRecord[]) => unknown;
  normalize: (item: JsonRecord) => NormalizedSubmission | null;
};

const DATA_DIR = path.join(process.cwd(), "data");

const SOURCE_CONFIGS: SourceConfig[] = [
  {
    type: "contact",
    fileName: "contact-submissions.json",
    extractItems: (raw) => (Array.isArray(raw) ? (raw as JsonRecord[]) : []),
    putItems: (_raw, nextItems) => nextItems,
    normalize: normalizeContact,
  },
  {
    type: "partner",
    fileName: "partner-applications.json",
    extractItems: (raw) => (Array.isArray(raw) ? (raw as JsonRecord[]) : []),
    putItems: (_raw, nextItems) => nextItems,
    normalize: normalizePartner,
  },
  {
    type: "contributor",
    fileName: "contributor-applications.json",
    extractItems: (raw) => (Array.isArray(raw) ? (raw as JsonRecord[]) : []),
    putItems: (_raw, nextItems) => nextItems,
    normalize: normalizeContributor,
  },
  {
    type: "kit-request",
    fileName: "kit-requests.json",
    extractItems: (raw) => {
      if (!raw || typeof raw !== "object") return [];
      const requests = (raw as JsonRecord).requests;
      return Array.isArray(requests) ? (requests as JsonRecord[]) : [];
    },
    putItems: (raw, nextItems) => {
      const base = raw && typeof raw === "object" ? (raw as JsonRecord) : {};
      return { ...base, requests: nextItems };
    },
    normalize: normalizeKitRequest,
  },
  {
    type: "glossary",
    fileName: "glossary-suggestions.json",
    extractItems: (raw) => (Array.isArray(raw) ? (raw as JsonRecord[]) : []),
    putItems: (_raw, nextItems) => nextItems,
    normalize: normalizeGlossary,
  },
];

const VALID_TYPES = SOURCE_CONFIGS.map((cfg) => cfg.type);
const VALID_STATUSES: SubmissionStatus[] = ["new", "reviewed", "archived"];

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeStatus(status: unknown): SubmissionStatus {
  if (status === "reviewed" || status === "archived") {
    return status;
  }

  return "new";
}

function extractIsoDate(item: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value) {
      return value;
    }
  }

  return new Date(0).toISOString();
}

function normalizeContact(item: JsonRecord): NormalizedSubmission | null {
  const id = toStringValue(item.id);
  if (!id) return null;

  return {
    id,
    type: "contact",
    status: normalizeStatus(item.status),
    submittedAt: extractIsoDate(item, ["submittedAt", "createdAt"]),
    title: toStringValue(item.subject, "Contact submission"),
    summary: toStringValue(item.message),
    submitter: toStringValue(item.name, "Unknown"),
    email: toStringValue(item.email) || undefined,
    sourceFile: "contact-submissions.json",
    data: item,
  };
}

function normalizePartner(item: JsonRecord): NormalizedSubmission | null {
  const id = toStringValue(item.id);
  if (!id) return null;

  const company = toStringValue(item.company);
  const appType = toStringValue(item.type);

  return {
    id,
    type: "partner",
    status: normalizeStatus(item.status),
    submittedAt: extractIsoDate(item, ["submittedAt", "createdAt"]),
    title: company ? `${company} ${appType || "partner"} application` : "Partner application",
    summary: toStringValue(item.message),
    submitter: toStringValue(item.name, "Unknown"),
    email: toStringValue(item.email) || undefined,
    sourceFile: "partner-applications.json",
    data: item,
  };
}

function normalizeContributor(item: JsonRecord): NormalizedSubmission | null {
  const id = toStringValue(item.id);
  if (!id) return null;

  const role = toStringValue(item.roleInterest);

  return {
    id,
    type: "contributor",
    status: normalizeStatus(item.status),
    submittedAt: extractIsoDate(item, ["submittedAt", "createdAt"]),
    title: role ? `${role} contributor application` : "Contributor application",
    summary: toStringValue(item.bio),
    submitter: toStringValue(item.name, "Unknown"),
    sourceFile: "contributor-applications.json",
    data: item,
  };
}

function normalizeKitRequest(item: JsonRecord): NormalizedSubmission | null {
  const id = toStringValue(item.id);
  if (!id) return null;

  return {
    id,
    type: "kit-request",
    status: normalizeStatus(item.status),
    submittedAt: extractIsoDate(item, ["createdAt", "submittedAt"]),
    title: toStringValue(item.kitName, "Kit request"),
    summary: toStringValue(item.useCase, toStringValue(item.description)),
    submitter: toStringValue(item.requesterAgentId, "Anonymous"),
    sourceFile: "kit-requests.json",
    data: item,
  };
}

function normalizeGlossary(item: JsonRecord): NormalizedSubmission | null {
  const id = toStringValue(item.id);
  if (!id) return null;

  const rawStatus = toStringValue(item.status);
  const status: SubmissionStatus =
    rawStatus === "reviewed" || rawStatus === "archived" ? rawStatus : "new";

  return {
    id,
    type: "glossary",
    status,
    submittedAt: extractIsoDate(item, ["createdAt", "submittedAt"]),
    title: toStringValue(item.term, "Glossary suggestion"),
    summary: toStringValue(item.definition),
    submitter: "Glossary contributor",
    sourceFile: "glossary-suggestions.json",
    data: item,
  };
}

async function readJson(filePath: string): Promise<unknown> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
}

async function loadSubmissions(types: SubmissionType[] | null): Promise<NormalizedSubmission[]> {
  const configs = types ? SOURCE_CONFIGS.filter((cfg) => types.includes(cfg.type)) : SOURCE_CONFIGS;

  const rows = await Promise.all(
    configs.map(async (config) => {
      const filePath = path.join(DATA_DIR, config.fileName);
      const raw = await readJson(filePath);
      const items = config.extractItems(raw);
      return items
        .map((item) => config.normalize(item))
        .filter((submission): submission is NormalizedSubmission => Boolean(submission));
    })
  );

  return rows
    .flat()
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

function parseTypeFilter(value: string | null): SubmissionType[] | null {
  if (!value) return null;

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  if (!parts.every((part): part is SubmissionType => VALID_TYPES.includes(part as SubmissionType))) {
    return null;
  }

  return parts as SubmissionType[];
}

export async function GET(request: NextRequest) {
  const typeParam = request.nextUrl.searchParams.get("type");
  const statusParam = request.nextUrl.searchParams.get("status");

  const types = parseTypeFilter(typeParam);
  if (typeParam && !types) {
    return NextResponse.json(
      {
        error: `Invalid type filter. Use one of: ${VALID_TYPES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (statusParam && !VALID_STATUSES.includes(statusParam as SubmissionStatus)) {
    return NextResponse.json(
      {
        error: "Invalid status filter. Use one of: new, reviewed, archived",
      },
      { status: 400 }
    );
  }

  const submissions = await loadSubmissions(types);
  const filtered = statusParam
    ? submissions.filter((submission) => submission.status === statusParam)
    : submissions;

  return NextResponse.json({
    submissions: filtered,
    total: filtered.length,
    filters: {
      type: typeParam,
      status: statusParam,
    },
  });
}

type PatchBody = {
  id?: unknown;
  type?: unknown;
  status?: unknown;
};

export async function PATCH(request: NextRequest) {
  let body: PatchBody;

  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const id = toStringValue(body.id).trim();
  const type = toStringValue(body.type).trim() as SubmissionType;
  const status = toStringValue(body.status).trim() as SubmissionStatus;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "status must be one of: new, reviewed, archived" },
      { status: 400 }
    );
  }

  const config = SOURCE_CONFIGS.find((source) => source.type === type);
  if (!config) {
    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
  }

  const filePath = path.join(DATA_DIR, config.fileName);
  const raw = await readJson(filePath);
  const items = config.extractItems(raw);
  const index = items.findIndex((item) => toStringValue(item.id) === id);

  if (index === -1) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const updatedItem: JsonRecord = {
    ...items[index],
    status,
  };

  const nextItems = [...items];
  nextItems[index] = updatedItem;
  const nextRaw = config.putItems(raw, nextItems);

  await writeJson(filePath, nextRaw);

  const normalized = config.normalize(updatedItem);

  return NextResponse.json({
    success: true,
    submission: normalized,
  });
}
