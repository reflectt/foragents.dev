import { NextRequest, NextResponse } from "next/server";
import { readJsonWithLimit } from "@/lib/requestLimits";
import type { CanaryCheck, CanaryRunStatus } from "@/lib/canaryRuns";
import { appendCanaryRun, readCanaryRuns } from "@/lib/server/canaryRunsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_000;

function isStatus(value: unknown): value is CanaryRunStatus {
  return value === "pass" || value === "fail" || value === "warning";
}

function sanitizePage(raw: string | null): number {
  const page = raw ? Number.parseInt(raw, 10) : 1;
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

function sanitizePageSize(raw: string | null): number {
  const pageSize = raw ? Number.parseInt(raw, 10) : 10;
  if (!Number.isFinite(pageSize)) return 10;
  return Math.max(1, Math.min(100, pageSize));
}

function normalizeCheckInput(raw: unknown): CanaryCheck | null {
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const skill = searchParams.get("skill")?.trim().toLowerCase() ?? "";
  const page = sanitizePage(searchParams.get("page"));
  const pageSize = sanitizePageSize(searchParams.get("pageSize"));

  const allRuns = await readCanaryRuns();

  const filtered = allRuns.filter((run) => {
    const statusMatch = isStatus(status) ? run.status === status : true;
    const skillMatch = skill
      ? run.skillSlug.toLowerCase().includes(skill) || run.skillName.toLowerCase().includes(skill)
      : true;

    return statusMatch && skillMatch;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const runs = filtered.slice(start, start + pageSize);

  return NextResponse.json(
    {
      runs,
      pagination: {
        page: safePage,
        pageSize,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
      filters: {
        status: isStatus(status) ? status : null,
        skill: skill || null,
      },
      skills: Array.from(new Set(allRuns.map((run) => run.skillSlug))).sort((a, b) => a.localeCompare(b)),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonWithLimit<Record<string, unknown>>(request, MAX_BODY_BYTES);

    const skillSlug = typeof body.skillSlug === "string" ? body.skillSlug.trim() : "";
    const skillName = typeof body.skillName === "string" ? body.skillName.trim() : "";
    const version = typeof body.version === "string" ? body.version.trim() : "";
    const duration = typeof body.duration === "number" ? body.duration : NaN;
    const rawStatus = body.status;
    const status = isStatus(rawStatus) ? rawStatus : null;

    const checks = Array.isArray(body.checks)
      ? body.checks
          .map((item) => normalizeCheckInput(item))
          .filter((item): item is CanaryCheck => Boolean(item))
      : [];

    const errors: string[] = [];

    if (!skillSlug) errors.push("skillSlug is required");
    if (!skillName) errors.push("skillName is required");
    if (!version) errors.push("version is required");
    if (!status) errors.push("status must be one of: pass, fail, warning");
    if (!Number.isFinite(duration) || duration < 0) errors.push("duration must be a non-negative number");
    if (checks.length === 0) errors.push("checks must include at least one valid check");

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const created = await appendCanaryRun({
      skillSlug,
      skillName,
      version,
      status: status as CanaryRunStatus,
      duration,
      checks,
    });

    return NextResponse.json(
      {
        run: created,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
