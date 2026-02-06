"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildCompareUrl, parseCompareIdsParam } from "@/lib/compare";
import { useCompareTray } from "@/components/compare/useCompareTray";
import type { Agent } from "@/lib/data";

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

export default function ComparePageClient({
  initialIds,
  initialAgents,
}: {
  initialIds: string[];
  initialAgents: Array<Agent | null>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tray = useCompareTray();

  const [ids, setIds] = useState<string[]>(initialIds);

  useEffect(() => {
    const a = searchParams.get("a");
    const parsed = parseCompareIdsParam(a);
    setIds(parsed);
  }, [searchParams]);

  useEffect(() => {
    const a = searchParams.get("a");
    if (!a) return;
    const parsed = parseCompareIdsParam(a);
    tray.clear();
    for (const id of parsed) tray.add(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setIdsAndSync(next: string[]) {
    setIds(next);
    tray.clear();
    for (const id of next) tray.add(id);
    router.replace(buildCompareUrl(next));
  }

  const resolvedAgents = useMemo(() => {
    const map = new Map(initialIds.map((id, i) => [id, initialAgents[i] || null]));
    return ids.map((id) => map.get(id) ?? null);
  }, [ids, initialIds, initialAgents]);

  async function copyLink() {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      return;
    }
    const el = document.createElement("textarea");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  const empty = ids.length === 0;
  const notEnough = ids.length > 0 && ids.length < 2;

  const rows: Array<{ label: string; render: (a: Agent | null) => React.ReactNode }> = [
    {
      label: "Role",
      render: (a) => <span className="text-sm text-foreground/90">{a?.role || "—"}</span>,
    },
    {
      label: "Platforms",
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {(a?.platforms || []).slice(0, 6).map((p) => (
            <span key={p} className="text-[11px] font-mono rounded border border-white/10 bg-white/5 px-2 py-0.5">
              {p}
            </span>
          ))}
          {(a?.platforms || []).length === 0 && <span className="text-sm text-muted-foreground">—</span>}
        </div>
      ),
    },
    {
      label: "Skills",
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {(a?.skills || []).slice(0, 8).map((s) => (
            <span key={s} className="text-[11px] font-mono rounded border border-white/10 bg-white/5 px-2 py-0.5">
              {s}
            </span>
          ))}
          {(a?.skills || []).length === 0 && <span className="text-sm text-muted-foreground">—</span>}
        </div>
      ),
    },
    {
      label: "Joined",
      render: (a) => <span className="text-sm text-foreground/90">{formatDate(a?.joinedAt)}</span>,
    },
    {
      label: "Verified",
      render: (a) => <span className="text-sm text-foreground/90">{a?.links?.agentJson ? "Yes" : "—"}</span>,
    },
    {
      label: "Links",
      render: (a) => (
        <div className="flex flex-col gap-1 text-sm">
          {a?.links?.website && (
            <a className="text-cyan hover:underline" href={a.links.website} target="_blank" rel="noreferrer">
              Website
            </a>
          )}
          {a?.links?.github && (
            <a className="text-cyan hover:underline" href={a.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {a?.links?.twitter && (
            <a className="text-cyan hover:underline" href={a.links.twitter} target="_blank" rel="noreferrer">
              X
            </a>
          )}
          {a?.links?.agentJson && (
            <a className="text-cyan hover:underline" href={a.links.agentJson} target="_blank" rel="noreferrer">
              agent.json
            </a>
          )}
          {!a?.links?.website && !a?.links?.github && !a?.links?.twitter && !a?.links?.agentJson && (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Compare agents</h1>
          <p className="text-sm text-muted-foreground">Pick 2–4 agents to compare side-by-side.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 px-3 rounded-md text-xs border border-white/10 text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors"
            onClick={() => setIdsAndSync([])}
          >
            Clear all
          </button>
          <button
            type="button"
            className="h-9 px-3 rounded-md text-xs bg-cyan text-[#0A0E17] font-semibold hover:brightness-110 transition-all"
            onClick={() => {
              copyLink().catch(() => null);
            }}
          >
            Copy link
          </button>
        </div>
      </header>

      {empty && (
        <div className="rounded-xl border border-white/10 bg-card/40 p-6">
          <p className="text-muted-foreground">Your comparison is empty. Add agents from the directory.</p>
          <div className="mt-4">
            <Link href="/agents" className="text-cyan hover:underline">
              Browse agents →
            </Link>
          </div>
        </div>
      )}

      {notEnough && (
        <div className="rounded-xl border border-white/10 bg-card/40 p-6">
          <p className="text-muted-foreground">Add at least 2 agents to compare.</p>
          <div className="mt-4">
            <Link href="/agents" className="text-cyan hover:underline">
              Browse agents →
            </Link>
          </div>
        </div>
      )}

      {!empty && ids.length >= 2 && (
        <div className="rounded-xl border border-white/10 bg-card/30 overflow-hidden">
          <div className="overflow-x-auto">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `minmax(140px, 200px) repeat(${ids.length}, minmax(240px, 1fr))`,
              }}
            >
              <div className="sticky left-0 z-20 bg-background/90 backdrop-blur border-b border-white/10 p-4">
                <span className="text-xs font-mono text-muted-foreground">Field</span>
              </div>
              {resolvedAgents.map((a, idx) => (
                <div key={ids[idx]} className="border-b border-white/10 p-4">
                  {a ? (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/agents/${a.handle}`} className="inline-flex items-center gap-2 hover:opacity-90">
                          <span className="text-2xl">{a.avatar}</span>
                          <span className="font-semibold truncate">{a.name}</span>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIdsAndSync(ids.filter((x) => x !== ids[idx]))}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">Unknown agent</p>
                        <p className="text-xs text-muted-foreground">ID: {ids[idx]}</p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIdsAndSync(ids.filter((x) => x !== ids[idx]))}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {rows.map((row) => (
                <div key={row.label} className="contents">
                  <div className="sticky left-0 z-10 bg-background/90 backdrop-blur border-b border-white/5 p-4">
                    <span className="text-xs font-mono text-muted-foreground">{row.label}</span>
                  </div>
                  {resolvedAgents.map((a, i) => (
                    <div key={`${row.label}:${ids[i]}`} className="border-b border-white/5 p-4">
                      {row.render(a)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
