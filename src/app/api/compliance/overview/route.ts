import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { readGovernancePolicies } from "@/lib/governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUDIT_DATA_PATH = path.join(process.cwd(), "data", "compliance-audits.json");
const AUDIT_STATUSES = ["pass", "fail", "partial", "na"] as const;

type AuditStatus = (typeof AUDIT_STATUSES)[number];

interface ComplianceAudit {
  id: string;
  framework: string;
  controlId: string;
  controlName: string;
  status: AuditStatus;
  evidence: string;
  auditor: string;
  auditDate: string;
  nextReviewDate: string;
  notes: string;
}

interface FrameworkBreakdown {
  framework: string;
  score: number;
  passed: number;
  partial: number;
  failed: number;
  notApplicable: number;
  totalApplicable: number;
  totalControls: number;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAuditStatus(value: unknown): value is AuditStatus {
  return typeof value === "string" && AUDIT_STATUSES.includes(value as AuditStatus);
}

function isValidDateString(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function isComplianceAudit(value: unknown): value is ComplianceAudit {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    isNonEmptyString(entry.id) &&
    isNonEmptyString(entry.framework) &&
    isNonEmptyString(entry.controlId) &&
    isNonEmptyString(entry.controlName) &&
    isAuditStatus(entry.status) &&
    isNonEmptyString(entry.evidence) &&
    isNonEmptyString(entry.auditor) &&
    isValidDateString(entry.auditDate) &&
    isValidDateString(entry.nextReviewDate) &&
    isNonEmptyString(entry.notes)
  );
}

async function readAuditData(): Promise<ComplianceAudit[]> {
  const raw = await fs.readFile(AUDIT_DATA_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed) || !parsed.every(isComplianceAudit)) {
    throw new Error("Invalid compliance audit dataset");
  }

  return parsed;
}

function calculateFrameworkBreakdown(audits: ComplianceAudit[]): FrameworkBreakdown[] {
  const frameworkMap = new Map<string, ComplianceAudit[]>();

  for (const audit of audits) {
    const bucket = frameworkMap.get(audit.framework) ?? [];
    bucket.push(audit);
    frameworkMap.set(audit.framework, bucket);
  }

  return Array.from(frameworkMap.entries())
    .map(([framework, frameworkAudits]) => {
      const passed = frameworkAudits.filter((audit) => audit.status === "pass").length;
      const partial = frameworkAudits.filter((audit) => audit.status === "partial").length;
      const failed = frameworkAudits.filter((audit) => audit.status === "fail").length;
      const notApplicable = frameworkAudits.filter((audit) => audit.status === "na").length;

      const totalApplicable = passed + partial + failed;
      const weightedPass = passed + partial * 0.5;
      const score = totalApplicable > 0 ? Math.round((weightedPass / totalApplicable) * 100) : 0;

      return {
        framework,
        score,
        passed,
        partial,
        failed,
        notApplicable,
        totalApplicable,
        totalControls: frameworkAudits.length,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function calculateOverallScore(frameworkBreakdown: FrameworkBreakdown[], policyActiveRate: number): number {
  if (frameworkBreakdown.length === 0) {
    return Math.round(policyActiveRate);
  }

  const frameworkAverage =
    frameworkBreakdown.reduce((sum, framework) => sum + framework.score, 0) / frameworkBreakdown.length;

  return Math.round(frameworkAverage * 0.75 + policyActiveRate * 0.25);
}

export async function GET() {
  try {
    const [audits, policies] = await Promise.all([readAuditData(), readGovernancePolicies()]);

    const frameworkBreakdown = calculateFrameworkBreakdown(audits);

    const policyStatusCounts = {
      active: policies.filter((policy) => policy.status === "active").length,
      review: policies.filter((policy) => policy.status === "review").length,
      draft: policies.filter((policy) => policy.status === "draft").length,
      total: policies.length,
    };

    const policyActiveRate =
      policyStatusCounts.total > 0 ? (policyStatusCounts.active / policyStatusCounts.total) * 100 : 0;

    const recentAudits = [...audits]
      .sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime())
      .slice(0, 5);

    return NextResponse.json(
      {
        overallComplianceScore: calculateOverallScore(frameworkBreakdown, policyActiveRate),
        frameworkBreakdown,
        policyStatusCounts,
        recentAudits,
        summary: {
          totalAudits: audits.length,
          totalFrameworks: frameworkBreakdown.length,
          activePolicies: policyStatusCounts.active,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Unable to load compliance overview",
      },
      {
        status: 500,
      }
    );
  }
}
