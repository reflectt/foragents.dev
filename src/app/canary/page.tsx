/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CanaryRunStatus } from "@/lib/canaryRuns";
import { readCanaryRuns } from "@/lib/server/canaryRunsStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Canary Runs — forAgents.dev",
  description: "Lightweight regression checks against key endpoints.",
  openGraph: {
    title: "Canary Runs — forAgents.dev",
    description: "Lightweight regression checks against key endpoints.",
    url: "https://foragents.dev/canary",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og/canary",
        width: 1200,
        height: 630,
        alt: "Canary Runs — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Canary Runs — forAgents.dev",
    description: "Lightweight regression checks against key endpoints.",
    images: ["/api/og/canary"],
  },
};

type CanaryPageProps = {
  searchParams?: Promise<{
    status?: string;
    skill?: string;
    page?: string;
    pageSize?: string;
  }>;
};

function formatDuration(ms: number) {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function isStatus(value: unknown): value is CanaryRunStatus {
  return value === "pass" || value === "fail" || value === "warning";
}

function statusClass(status: CanaryRunStatus) {
  if (status === "pass") return "bg-green-500/10 text-green-400 border-green-500/30";
  if (status === "warning") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/10 text-red-400 border-red-500/30";
}

function sanitizePositiveInt(raw: string | undefined, fallback: number) {
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

function buildPageHref({
  status,
  skill,
  page,
  pageSize,
}: {
  status: string;
  skill: string;
  page: number;
  pageSize: number;
}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (skill) params.set("skill", skill);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return `/canary?${params.toString()}`;
}

export default async function CanaryPage({ searchParams }: CanaryPageProps) {
  const sp = (await searchParams) || {};
  const selectedStatus = isStatus(sp.status) ? sp.status : "";
  const selectedSkill = (sp.skill ?? "").trim().toLowerCase();
  const page = sanitizePositiveInt(sp.page, 1);
  const pageSize = Math.min(50, sanitizePositiveInt(sp.pageSize, 8));

  const allRuns = await readCanaryRuns();

  const filteredRuns = allRuns.filter((run) => {
    const statusMatch = selectedStatus ? run.status === selectedStatus : true;
    const skillMatch = selectedSkill
      ? run.skillSlug.toLowerCase().includes(selectedSkill) || run.skillName.toLowerCase().includes(selectedSkill)
      : true;

    return statusMatch && skillMatch;
  });

  const totalRuns = filteredRuns.length;
  const totalPages = Math.max(1, Math.ceil(totalRuns / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paginatedRuns = filteredRuns.slice(start, start + pageSize);

  const uniqueSkills = Array.from(new Set(allRuns.map((run) => run.skillSlug))).sort((a, b) => a.localeCompare(b));

  const passCount = filteredRuns.filter((run) => run.status === "pass").length;
  const warningCount = filteredRuns.filter((run) => run.status === "warning").length;
  const failCount = filteredRuns.filter((run) => run.status === "fail").length;
  const avgDuration =
    filteredRuns.length > 0
      ? filteredRuns.reduce((sum, run) => sum + run.duration, 0) / filteredRuns.length
      : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Canary Runs</h1>
          <p className="text-muted-foreground mt-2">Persistent canary history with skill-level regression detection.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Passing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{passCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{warningCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Failures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{failCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatDuration(avgDuration)}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Timeline</h2>
            <p className="text-muted-foreground">Filter by status/skill, then expand a run to inspect individual checks.</p>
          </div>
          <Link href="/api/canary" className="text-sm text-muted-foreground hover:text-foreground">
            View API JSON →
          </Link>
        </div>

        <Card className="bg-card/50 border-white/5 mb-6">
          <CardContent className="p-4">
            <form className="grid gap-4 md:grid-cols-4" action="/canary" method="get">
              <label className="text-sm text-muted-foreground">
                Status
                <select
                  name="status"
                  defaultValue={selectedStatus}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground"
                >
                  <option value="">All statuses</option>
                  <option value="pass">Pass</option>
                  <option value="warning">Warning</option>
                  <option value="fail">Fail</option>
                </select>
              </label>

              <label className="text-sm text-muted-foreground">
                Skill
                <select
                  name="skill"
                  defaultValue={selectedSkill}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground"
                >
                  <option value="">All skills</option>
                  {uniqueSkills.map((skillSlug) => (
                    <option key={skillSlug} value={skillSlug}>
                      {skillSlug}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-muted-foreground">
                Page Size
                <select
                  name="pageSize"
                  defaultValue={String(pageSize)}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground"
                >
                  <option value="5">5</option>
                  <option value="8">8</option>
                  <option value="12">12</option>
                  <option value="20">20</option>
                </select>
              </label>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="h-10 rounded-md bg-white/10 px-4 text-sm font-medium text-foreground hover:bg-white/15"
                >
                  Apply Filters
                </button>
                <Link
                  href="/canary"
                  className="h-10 rounded-md border border-white/10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center"
                >
                  Reset
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {paginatedRuns.length === 0 ? (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-6 text-muted-foreground">No runs match the active filters.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedRuns.map((run, index) => (
              <div key={run.id} className="relative pl-7">
                {index !== paginatedRuns.length - 1 ? (
                  <span className="absolute left-2.5 top-6 h-[calc(100%+0.75rem)] w-px bg-white/10" aria-hidden />
                ) : null}
                <span className="absolute left-0 top-4 h-5 w-5 rounded-full border border-white/20 bg-black/80" aria-hidden />

                <Card className="bg-card/50 border-white/5">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-muted-foreground">{new Date(run.timestamp).toLocaleString()}</div>
                        <div className="text-lg font-semibold text-foreground">{run.skillName}</div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">{run.skillSlug} · v{run.version}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={statusClass(run.status)}>
                          {run.status.toUpperCase()}
                        </Badge>
                        {run.regression ? (
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                            REGRESSION
                          </Badge>
                        ) : null}
                        <Badge variant="outline" className="bg-white/5 border-white/20 text-muted-foreground">
                          {formatDuration(run.duration)}
                        </Badge>
                      </div>
                    </div>

                    <details className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
                      <summary className="cursor-pointer text-sm text-foreground">View check details</summary>
                      <div className="mt-3 space-y-3">
                        {run.checks.map((check) => (
                          <div key={`${run.id}-${check.name}`} className="rounded border border-white/10 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm font-medium text-foreground">{check.name}</div>
                              <Badge variant="outline" className={statusClass(check.status)}>
                                {check.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{check.message}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing page {safePage} of {totalPages} · {totalRuns} run{totalRuns === 1 ? "" : "s"}
          </span>

          <div className="flex items-center gap-2">
            {safePage > 1 ? (
              <Link
                href={buildPageHref({ status: selectedStatus, skill: selectedSkill, page: safePage - 1, pageSize })}
                className="rounded-md border border-white/10 px-3 py-1.5 hover:text-foreground"
              >
                Previous
              </Link>
            ) : null}

            {safePage < totalPages ? (
              <Link
                href={buildPageHref({ status: selectedStatus, skill: selectedSkill, page: safePage + 1, pageSize })}
                className="rounded-md border border-white/10 px-3 py-1.5 hover:text-foreground"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
