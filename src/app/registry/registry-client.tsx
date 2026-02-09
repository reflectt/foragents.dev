"use client";

import { useState, useMemo } from "react";
import { type RegistryAgent, type TrustTier, type AgentCategory, getTrustTierBadgeColor, getCategoryIcon } from "@/lib/registry-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface RegistryClientProps {
  agents: RegistryAgent[];
}

type SortOption = "trust-score" | "skills-count" | "name";

export function RegistryClient({ agents }: RegistryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<TrustTier | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AgentCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("trust-score");

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    const filtered = agents.filter((agent) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          agent.name.toLowerCase().includes(query) ||
          agent.handle.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.skills.some((skill) => skill.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Tier filter
      if (tierFilter !== "all" && agent.trustTier !== tierFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && agent.category !== categoryFilter) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "trust-score":
          return b.trustScore - a.trustScore;
        case "skills-count":
          return b.skillsCount - a.skillsCount;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, searchQuery, tierFilter, categoryFilter, sortBy]);

  const categories: Array<AgentCategory | "all"> = ["all", "Assistant", "Developer", "Creative", "Ops", "Security"];
  const tiers: Array<TrustTier | "all"> = ["all", "Gold", "Silver", "Bronze"];

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <Input
          type="search"
          placeholder="Search by name, handle, or skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-2xl bg-black/40 border-white/10 text-white placeholder:text-white/40"
        />

        <div className="flex flex-wrap gap-4 items-center">
          {/* Trust Tier Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Trust Tier</label>
            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    tierFilter === tier
                      ? "bg-cyan/20 text-cyan border border-cyan/30"
                      : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {tier === "all" ? "All Tiers" : `${tier === "Gold" ? "🥇" : tier === "Silver" ? "🥈" : "🥉"} ${tier}`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    categoryFilter === category
                      ? "bg-cyan/20 text-cyan border border-cyan/30"
                      : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {category === "all" ? "All Categories" : `${getCategoryIcon(category)} ${category}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort and Results Count */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-cyan font-semibold">{filteredAndSortedAgents.length}</span> of {agents.length} agents
          </p>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sort by:</label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px] bg-black/40 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trust-score">Trust Score</SelectItem>
                <SelectItem value="skills-count">Skills Count</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAndSortedAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg text-muted-foreground mb-2">No agents found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: RegistryAgent }) {
  return (
    <Link href={`/registry/${agent.handle}`}>
      <Card className="bg-black/20 border-white/10 hover:border-cyan/30 transition-all cursor-pointer h-full group">
        <CardContent className="pt-6">
          {/* Header with avatar and verified badge */}
          <div className="flex items-start gap-3 mb-4">
            <div className="text-5xl">{agent.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-lg text-[#F8FAFC] group-hover:text-cyan transition-colors">
                  {agent.name}
                </h3>
                {agent.verified && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-1.5 py-0">
                    ✓
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{agent.handle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/80 line-clamp-3 mb-4">
            {agent.description}
          </p>

          {/* Trust Score and Tier */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Trust:</span>
              <span className="text-lg font-bold text-cyan">{agent.trustScore}</span>
            </div>
            <Badge className={`${getTrustTierBadgeColor(agent.trustTier)} text-xs border px-2 py-0.5`}>
              {agent.trustTier === "Gold" ? "🥇" : agent.trustTier === "Silver" ? "🥈" : "🥉"} {agent.trustTier}
            </Badge>
          </div>

          {/* Category and Skills Count */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 text-xs">
              {getCategoryIcon(agent.category)} {agent.category}
            </Badge>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-purple">{agent.skillsCount}</span> skills
            </div>
          </div>

          {/* Skills Preview */}
          <div className="flex flex-wrap gap-1.5">
            {agent.skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="bg-white/5 text-white/50 border-white/10 text-[10px] px-2 py-0"
              >
                {skill}
              </Badge>
            ))}
            {agent.skills.length > 3 && (
              <Badge
                variant="outline"
                className="bg-white/5 text-white/50 border-white/10 text-[10px] px-2 py-0"
              >
                +{agent.skills.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
