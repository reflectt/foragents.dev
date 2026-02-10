import { promises as fs } from "fs";
import path from "path";
import type { CanaryCheck, CanaryRun, CanaryRunStatus } from "@/lib/canaryRuns";

const CANARY_RUNS_PATH = path.join(process.cwd(), "data", "canary-runs.json");
const MAX_STORED_RUNS = 1_000;

function isStatus(value: unknown): value is CanaryRunStatus {
  return value === "pass" || value === "fail" || value === "warning";
}

function normalizeCheck(raw: unknown): CanaryCheck | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;
  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  const message = typeof obj.message === "string" ? obj.message.trim() : "";

  if (!name || !message || !isStatus(obj.status)) return null;

  return {
    name,
    status: obj.status,
    message,
  };
}

function normalizeRun(raw: unknown): CanaryRun | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;
  const checks = Array.isArray(obj.checks)
    ? obj.checks.map((item) => normalizeCheck(item)).filter((item): item is CanaryCheck => Boolean(item))
    : [];

  if (
    typeof obj.id !== "string" ||
    typeof obj.skillSlug !== "string" ||
    typeof obj.skillName !== "string" ||
    typeof obj.version !== "string" ||
    !isStatus(obj.status) ||
    typeof obj.duration !== "number" ||
    !Number.isFinite(obj.duration) ||
    obj.duration < 0 ||
    typeof obj.timestamp !== "string" ||
    typeof obj.regression !== "boolean" ||
    checks.length === 0
  ) {
    return null;
  }

  return {
    id: obj.id,
    skillSlug: obj.skillSlug,
    skillName: obj.skillName,
    version: obj.version,
    status: obj.status,
    duration: obj.duration,
    timestamp: obj.timestamp,
    checks,
    regression: obj.regression,
  };
}

function sortRunsDesc(runs: CanaryRun[]): CanaryRun[] {
  return [...runs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function readCanaryRuns(): Promise<CanaryRun[]> {
  try {
    const raw = await fs.readFile(CANARY_RUNS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    const list = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { runs?: unknown[] }).runs)
        ? (parsed as { runs: unknown[] }).runs
        : [];

    return sortRunsDesc(
      list
        .map((item) => normalizeRun(item))
        .filter((item): item is CanaryRun => Boolean(item))
    );
  } catch {
    return [];
  }
}

export async function writeCanaryRuns(runs: CanaryRun[]): Promise<void> {
  await fs.mkdir(path.dirname(CANARY_RUNS_PATH), { recursive: true });
  const sorted = sortRunsDesc(runs).slice(0, MAX_STORED_RUNS);
  await fs.writeFile(CANARY_RUNS_PATH, JSON.stringify(sorted, null, 2) + "\n", "utf-8");
}

export async function appendCanaryRun(input: Omit<CanaryRun, "id" | "timestamp" | "regression">): Promise<CanaryRun> {
  const existing = await readCanaryRuns();
  const previousForSkill = existing.find((run) => run.skillSlug === input.skillSlug);
  const regression = previousForSkill?.status === "pass" && input.status !== "pass";

  const newRun: CanaryRun = {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? `canary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    regression,
  };

  await writeCanaryRuns([newRun, ...existing]);
  return newRun;
}
