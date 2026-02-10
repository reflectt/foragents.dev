/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AuditStatus = "pass" | "fail" | "partial" | "na";

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

interface RecentAudit {
  id: string;
  framework: string;
  controlId: string;
  controlName: string;
  status: AuditStatus;
  auditDate: string;
  auditor: string;
}

interface ComplianceOverviewResponse {
  overallComplianceScore: number;
  frameworkBreakdown: FrameworkBreakdown[];
  policyStatusCounts: {
    active: number;
    review: number;
    draft: number;
    total: number;
  };
  recentAudits: RecentAudit[];
  summary: {
    totalAudits: number;
    totalFrameworks: number;
    activePolicies: number;
  };
}

const SUB_PAGE_LINKS = [
  {
    title: "Audit Tracker",
    description: "Inspect control-level findings and framework performance.",
    href: "/compliance/audit",
  },
  {
    title: "Governance Framework",
    description: "Review operational, security, and policy governance standards.",
    href: "/compliance/governance",
  },
  {
    title: "Responsible AI",
    description: "See ethics-oriented policies and responsible AI principles.",
    href: "/compliance/responsible-ai",
  },
] as const;

function scoreBarClass(score: number) {
  if (score >= 85) {
    return "bg-emerald-400";
  }

  if (score >= 70) {
    return "bg-amber-400";
  }

  return "bg-rose-400";
}

function statusChipClass(status: AuditStatus) {
  if (status === "pass") return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
  if (status === "partial") return "text-amber-300 border-amber-500/40 bg-amber-500/10";
  if (status === "na") return "text-slate-300 border-slate-500/40 bg-slate-500/10";
  return "text-rose-300 border-rose-500/40 bg-rose-500/10";
}

function formatDate(dateInput: string) {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ComplianceHubClient() {
  const [data, setData] = useState<ComplianceOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/compliance/overview", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load compliance overview");
        }

        const payload = (await response.json()) as ComplianceOverviewResponse;

        if (!isCancelled) {
          setData(payload);
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to load compliance overview right now. Please try again.");
          setData(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 w-full">
          <Badge className="mb-4 bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20">Live Aggregated Compliance Data</Badge>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">Compliance Hub</h1>
          <p className="text-lg text-foreground/80 max-w-2xl">
            Unified view across audits and governance policies with framework-level scores, policy status totals, and recent findings.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <Card className="border-white/10 bg-card/30">
            <CardContent className="py-8 text-sm text-foreground/70">Loading compliance overview...</CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-rose-500/30 bg-rose-500/10">
            <CardContent className="py-8 flex items-center gap-3 text-rose-200 text-sm">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </CardContent>
          </Card>
        ) : null}

        {!loading && !error && data ? (
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-12 border-white/10 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xl">Overall compliance score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:items-center">
                  <div className="space-y-2">
                    <p className="text-5xl font-bold text-[#F8FAFC]">{data.overallComplianceScore}%</p>
                    <p className="text-sm text-foreground/70">
                      {data.summary.totalFrameworks} frameworks · {data.summary.totalAudits} audits · {data.policyStatusCounts.total} policies
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full ${scoreBarClass(data.overallComplianceScore)}`}
                        style={{ width: `${data.overallComplianceScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-foreground/60">Weighted from framework scores (75%) and active-policy rate (25%).</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-12 border-white/10 bg-card/30">
              <CardHeader>
                <CardTitle>Framework breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {data.frameworkBreakdown.map((framework) => (
                    <article key={framework.framework} className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-[#F8FAFC]">{framework.framework}</h3>
                        <Badge variant="secondary">{framework.score}%</Badge>
                      </div>

                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full ${scoreBarClass(framework.score)}`} style={{ width: `${framework.score}%` }} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-foreground/70">
                        <p>Pass: {framework.passed}</p>
                        <p>Partial: {framework.partial}</p>
                        <p>Fail: {framework.failed}</p>
                        <p>N/A: {framework.notApplicable}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-4 border-white/10 bg-card/30">
              <CardHeader>
                <CardTitle>Policy status summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span className="text-foreground/70">Active</span><span>{data.policyStatusCounts.active}</span></p>
                  <p className="flex justify-between"><span className="text-foreground/70">In review</span><span>{data.policyStatusCounts.review}</span></p>
                  <p className="flex justify-between"><span className="text-foreground/70">Draft</span><span>{data.policyStatusCounts.draft}</span></p>
                  <Separator className="opacity-20 my-2" />
                  <p className="flex justify-between font-medium"><span>Total</span><span>{data.policyStatusCounts.total}</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-8 border-white/10 bg-card/30">
              <CardHeader>
                <CardTitle>Recent audits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentAudits.map((audit) => (
                    <article key={audit.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-white/20 bg-white/5">{audit.framework}</Badge>
                        <Badge variant="outline" className={`uppercase ${statusChipClass(audit.status)}`}>{audit.status}</Badge>
                        <span className="text-xs text-foreground/60">{formatDate(audit.auditDate)}</span>
                      </div>
                      <p className="text-sm font-medium text-[#F8FAFC]">{audit.controlName}</p>
                      <p className="text-xs text-foreground/60 mt-1">{audit.controlId} · Auditor: {audit.auditor}</p>
                    </article>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-12 border-white/10 bg-card/30">
              <CardHeader>
                <CardTitle>Compliance sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {SUB_PAGE_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} className="rounded-lg border border-white/10 bg-black/20 p-4 hover:border-[#06D6A0]/40 transition-colors block">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-[#F8FAFC]">{link.title}</h3>
                        <ArrowRight className="h-4 w-4 text-[#06D6A0]" />
                      </div>
                      <p className="text-sm text-foreground/70">{link.description}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>
    </div>
  );
}
