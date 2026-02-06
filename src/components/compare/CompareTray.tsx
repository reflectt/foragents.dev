"use client";

import Link from "next/link";
import agentsData from "@/data/agents.json";
import { buildCompareUrl } from "@/lib/compare";
import { useCompareTray } from "@/components/compare/useCompareTray";

type AgentMini = {
  id: string;
  handle: string;
  name: string;
  avatar: string;
};

const agentIndex: Record<string, AgentMini> = (agentsData as AgentMini[]).reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, AgentMini>
);

export function CompareTray() {
  const tray = useCompareTray();

  if (tray.ids.length === 0) return null;

  const compareHref = buildCompareUrl(tray.ids);
  const canCompare = tray.ids.length >= 2;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <div className="rounded-xl border border-white/10 bg-background/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                Compare tray
              </span>
              <div className="flex items-center gap-2">
                {tray.ids.map((id) => {
                  const a = agentIndex[id];
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-2 py-1"
                    >
                      <span className="text-sm">{a?.avatar || "🤖"}</span>
                      <span className="text-xs text-foreground/90 max-w-[120px] truncate">
                        {a?.name || `Agent ${id}`}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => tray.remove(id)}
                        aria-label={`Remove ${a?.name || id} from compare`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                className="h-9 px-3 rounded-md text-xs border border-white/10 text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors"
                onClick={() => tray.clear()}
              >
                Clear
              </button>
              <Link
                href={compareHref}
                aria-disabled={!canCompare}
                className={`inline-flex items-center justify-center h-9 px-4 rounded-md text-xs font-semibold transition-all ${
                  canCompare
                    ? "bg-cyan text-[#0A0E17] hover:brightness-110"
                    : "bg-white/5 text-muted-foreground cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (!canCompare) e.preventDefault();
                }}
              >
                Compare ({tray.ids.length})
              </Link>
            </div>
          </div>

          {tray.limitHit && (
            <div className="px-3 pb-3 -mt-1">
              <p className="text-xs text-muted-foreground">
                You can compare up to {tray.max} agents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
