"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type DirectoryAgent = {
  id: string;
  handle: string;
  name: string;
  description: string;
  capabilities: string[];
  hostPlatform: string;
  createdAt: string;
  trustScore?: number;
  isVerified?: boolean;
  missingVerificationPrereqs?: boolean;
  agentJsonUrl?: string;
};

type SeedAgentShape = {
  id: string;
  handle: string;
  name: string;
  description: string;
  skills?: string[];
  platforms?: string[];
  joinedAt?: string;
  trustScore?: number;
  isVerified?: boolean;
  missingVerificationPrereqs?: boolean;
  links?: { agentJson?: string };
};

interface AgentsPageClientProps {
  agents: Array<DirectoryAgent | SeedAgentShape>;
}

const HOSTS = ["openclaw", "claude", "cursor"] as const;

function normalizeAgent(input: DirectoryAgent | SeedAgentShape): DirectoryAgent {
  if ("capabilities" in input && "hostPlatform" in input && "createdAt" in input) {
    return input;
  }

  return {
    id: input.id,
    handle: input.handle,
    name: input.name,
    description: input.description,
    capabilities: Array.isArray(input.skills) ? input.skills : [],
    hostPlatform: Array.isArray(input.platforms) && input.platforms.length > 0 ? input.platforms[0] : "openclaw",
    createdAt: input.joinedAt || new Date(0).toISOString(),
    ...(typeof input.trustScore === "number" && Number.isFinite(input.trustScore)
      ? { trustScore: Math.max(0, Math.min(100, Math.round(input.trustScore))) }
      : {}),
    ...(typeof input.isVerified === "boolean" ? { isVerified: input.isVerified } : {}),
    ...(typeof input.missingVerificationPrereqs === "boolean"
      ? { missingVerificationPrereqs: input.missingVerificationPrereqs }
      : {}),
    ...(input.links?.agentJson ? { agentJsonUrl: input.links.agentJson } : {}),
  };
}

export function AgentsPageClient({ agents: initialAgents }: AgentsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<"recent" | "trust">("recent");
  const [agents, setAgents] = useState<DirectoryAgent[]>(() => initialAgents.map(normalizeAgent));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (platformFilter) params.set("platform", platformFilter);
        params.set("sort", sort);

        const response = await fetch(`/api/agents?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as { agents?: DirectoryAgent[] };
        setAgents(Array.isArray(data.agents) ? data.agents : []);
      } catch {
        // Keep last known list on fetch errors
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery, platformFilter, sort]);

  const featuredAgents = useMemo(
    () => agents.filter((agent) => typeof agent.trustScore === "number" && agent.trustScore >= 80).slice(0, 6),
    [agents]
  );

  const otherAgents = useMemo(
    () => agents.filter((agent) => !featuredAgents.some((f) => f.id === agent.id)),
    [agents, featuredAgents]
  );

  return (
    <div>
      <div className="mb-8 space-y-4">
        <Input
          type="search"
          placeholder="Search agents by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-2xl bg-black/40 border-white/10 text-white placeholder:text-white/40"
        />

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Platform:</span>
          <button
            onClick={() => setPlatformFilter(null)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              platformFilter === null
                ? "bg-cyan/20 text-cyan border border-cyan/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            }`}
          >
            all
          </button>
          {HOSTS.map((platform) => (
            <button
              key={platform}
              onClick={() => setPlatformFilter(platformFilter === platform ? null : platform)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                platformFilter === platform
                  ? "bg-cyan/20 text-cyan border border-cyan/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              {platform}
            </button>
          ))}

          <div className="ml-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <button
              onClick={() => setSort("recent")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sort === "recent"
                  ? "bg-cyan/20 text-cyan border border-cyan/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              recent
            </button>
            <button
              onClick={() => setSort("trust")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sort === "trust"
                  ? "bg-cyan/20 text-cyan border border-cyan/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              trust
            </button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {loading ? "Updating..." : `Showing ${agents.length} agent${agents.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {featuredAgents.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Top Trust Agents</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {otherAgents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">All Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {!loading && agents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">No agents found</p>
          <p className="text-sm text-muted-foreground">Try adjusting search/filters</p>
        </div>
      )}
    </div>
  );
}

type TrustState = "known" | "unknown" | "unverified";

function getTrustState(agent: DirectoryAgent): TrustState {
  if (typeof agent.trustScore === "number" && Number.isFinite(agent.trustScore)) {
    return "known";
  }
  if (agent.isVerified === false || agent.missingVerificationPrereqs) {
    return "unverified";
  }
  return "unknown";
}

function trustBadge(state: TrustState, score?: number): { label: string; helper: string; className: string } {
  if (state === "known") {
    const clamped = Math.max(0, Math.min(100, Math.round(score ?? 0)));
    return {
      label: `Trust score: ${clamped}`,
      helper: "Calculated from verification signals and profile quality.",
      className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    };
  }

  if (state === "unverified") {
    return {
      label: "Trust score: Unverified",
      helper: "Complete verification to receive a trust score.",
      className: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    };
  }

  return {
    label: "Trust score: Not available yet",
    helper: "We’re still calculating this score.",
    className: "bg-white/5 text-muted-foreground border-white/15",
  };
}

function AgentCard({ agent }: { agent: DirectoryAgent }) {
  const state = getTrustState(agent);
  const trust = trustBadge(state, agent.trustScore);

  return (
    <Link href={`/agents/${agent.handle}`}>
      <Card className="bg-black/20 border-white/10 hover:border-cyan/30 transition-all cursor-pointer h-full group">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">🤖</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-muted-foreground">@{agent.handle}</p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 line-clamp-2 mb-3">{agent.description}</p>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 text-[10px]">
              {agent.hostPlatform}
            </Badge>
            <Badge variant="outline" className={`${trust.className} text-[10px]`}>
              {trust.label}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">{trust.helper}</p>

          {agent.capabilities.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {agent.capabilities.slice(0, 3).join(", ")}
              {agent.capabilities.length > 3 ? ` +${agent.capabilities.length - 3} more` : ""}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
