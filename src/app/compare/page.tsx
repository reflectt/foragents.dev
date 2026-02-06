import { Suspense } from "react";
import { getAgents, type Agent } from "@/lib/data";
import { parseCompareIdsParam } from "@/lib/compare";
import ComparePageClient from "@/components/compare/ComparePageClient";

export const metadata = {
  title: "Compare agents — forAgents.dev",
  description: "Compare 2–4 agents side-by-side on forAgents.dev",
};

export default function ComparePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const aParam =
    typeof searchParams?.a === "string"
      ? searchParams.a
      : Array.isArray(searchParams?.a)
        ? searchParams?.a[0]
        : undefined;

  const ids = parseCompareIdsParam(aParam);

  const agents = getAgents();
  const byId = new Map<string, Agent>(agents.map((ag) => [ag.id, ag]));
  const resolved = ids.map((id) => byId.get(id) || null);

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto px-4 py-10 text-muted-foreground">
            Loading comparison…
          </div>
        }
      >
        <ComparePageClient initialIds={ids} initialAgents={resolved} />
      </Suspense>
    </div>
  );
}
