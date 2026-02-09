"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ecosystemStats from "@/data/ecosystem-stats.json";

interface EcosystemStatsData {
  overview: {
    totalSkills: number;
    totalAgents: number;
    totalDownloads: number;
    activeContributors: number;
    mcpServersTracked: number;
    lastUpdated: string;
  };
  growth: {
    monthlyData: Array<{
      month: string;
      skills: number;
      agents: number;
    }>;
  };
  categories: Array<{
    id: string;
    name: string;
    color: string;
    skillCount: number;
    percentage: number;
  }>;
  topContributors: Array<{
    id: string;
    name: string;
    avatar: string;
    skillsCreated: number;
    totalDownloads: number;
    githubUsername: string;
  }>;
  technologyStack: Array<{
    name: string;
    percentage: number;
    color: string;
    skillCount: number;
  }>;
  compatibilityMatrix: Array<{
    host: string;
    logo: string;
    compatibleSkills: number;
    totalSkills: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    author: string;
    timestamp: string;
    icon: string;
  }>;
}

const data = ecosystemStats as EcosystemStatsData;

// Helper to format numbers
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Helper to format relative time
const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function EcosystemStatsPage() {
  // Calculate max value for growth chart normalization
  const maxSkills = Math.max(...data.growth.monthlyData.map((m) => m.skills));
  const maxAgents = Math.max(...data.growth.monthlyData.map((m) => m.agents));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Ecosystem Stats
          </h1>
          <p className="text-xl text-foreground/80 mb-6">
            Live metrics and insights from the forAgents.dev community
          </p>

          {/* Last Updated */}
          <div className="text-sm text-muted-foreground">
            Last updated:{" "}
            {new Date(data.overview.lastUpdated).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Overview Cards */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-card/30 border-[#06D6A0]/20">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Total Skills</div>
              <div className="text-4xl font-bold text-[#06D6A0]">
                {formatNumber(data.overview.totalSkills)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#8B5CF6]/10 to-card/30 border-[#8B5CF6]/20">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Total Agents</div>
              <div className="text-4xl font-bold text-[#8B5CF6]">
                {formatNumber(data.overview.totalAgents)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#3B82F6]/10 to-card/30 border-[#3B82F6]/20">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Total Downloads</div>
              <div className="text-4xl font-bold text-[#3B82F6]">
                {formatNumber(data.overview.totalDownloads)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#F59E0B]/10 to-card/30 border-[#F59E0B]/20">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Active Contributors</div>
              <div className="text-4xl font-bold text-[#F59E0B]">
                {formatNumber(data.overview.activeContributors)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#EC4899]/10 to-card/30 border-[#EC4899]/20">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">MCP Servers</div>
              <div className="text-4xl font-bold text-[#EC4899]">
                {formatNumber(data.overview.mcpServersTracked)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Growth Chart */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Growth Over Time</h2>
        <Card className="bg-card/30 border-white/10">
          <CardContent className="pt-6">
            <div className="space-y-8">
              {/* Skills Growth */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#06D6A0]">Skills Added Per Month</h3>
                  <div className="text-sm text-muted-foreground">Peak: {maxSkills} skills</div>
                </div>
                <div className="flex items-end gap-2 h-48">
                  {data.growth.monthlyData.map((month, idx) => {
                    const heightPercent = (month.skills / maxSkills) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full flex-1 flex items-end group">
                          <div
                            className="w-full bg-gradient-to-t from-[#06D6A0] to-[#06D6A0]/50 rounded-t-lg transition-all hover:brightness-125"
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="absolute inset-x-0 -top-8 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-sm font-bold text-[#06D6A0]">{month.skills}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap transform -rotate-45 origin-top-left mt-2">
                          {month.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agents Growth */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#8B5CF6]">New Agents Per Month</h3>
                  <div className="text-sm text-muted-foreground">Peak: {maxAgents} agents</div>
                </div>
                <div className="flex items-end gap-2 h-48">
                  {data.growth.monthlyData.map((month, idx) => {
                    const heightPercent = (month.agents / maxAgents) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full flex-1 flex items-end group">
                          <div
                            className="w-full bg-gradient-to-t from-[#8B5CF6] to-[#8B5CF6]/50 rounded-t-lg transition-all hover:brightness-125"
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="absolute inset-x-0 -top-8 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-sm font-bold text-[#8B5CF6]">{month.agents}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap transform -rotate-45 origin-top-left mt-2">
                          {month.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Category Distribution & Top Contributors */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Category Distribution</h2>
            <Card className="bg-card/30 border-white/10">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {data.categories.map((category) => (
                    <div key={category.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {category.skillCount} skills
                          </span>
                          <span className="text-sm font-semibold" style={{ color: category.color }}>
                            {category.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Contributors */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Top Contributors</h2>
            <Card className="bg-card/30 border-white/10">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {data.topContributors.map((contributor, idx) => (
                    <div
                      key={contributor.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-lg font-bold text-muted-foreground w-6">
                          #{idx + 1}
                        </div>
                        <Image
                          src={contributor.avatar}
                          alt={contributor.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-semibold">{contributor.name}</div>
                          <div className="text-xs text-muted-foreground">
                            @{contributor.githubUsername}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#06D6A0]">
                          {contributor.skillsCreated} skills
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatNumber(contributor.totalDownloads)} downloads
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Technology Stack Distribution */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Technology Stack Distribution</h2>
        <Card className="bg-card/30 border-white/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {data.technologyStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${tech.color}15`,
                    borderColor: `${tech.color}40`,
                  }}
                >
                  <div className="text-3xl font-bold" style={{ color: tech.color }}>
                    {tech.percentage.toFixed(1)}%
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-sm mb-1">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.skillCount} skills</div>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${tech.percentage}%`,
                        backgroundColor: tech.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Compatibility Matrix */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Host Compatibility Matrix</h2>
        <Card className="bg-card/30 border-white/10">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data.compatibilityMatrix.map((host) => (
                <div key={host.host} className="flex items-center gap-4">
                  <div className="flex items-center gap-3 w-48">
                    <span className="text-3xl">{host.logo}</span>
                    <span className="font-semibold">{host.host}</span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-8 bg-white/5 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#06D6A0] to-[#06D6A0]/70 flex items-center justify-end px-4 transition-all"
                        style={{ width: `${host.percentage}%` }}
                      >
                        <span className="text-sm font-bold text-[#0a0a0a]">
                          {host.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground w-32 text-right">
                    {host.compatibleSkills} / {host.totalSkills} skills
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Recent Activity Feed */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <Card className="bg-card/30 border-white/10">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{activity.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {activity.description}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-white/20 bg-white/5"
                      >
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        by {activity.author}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Contribute to the Ecosystem
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join {formatNumber(data.overview.activeContributors)} contributors building the future of AI agents. Every
              skill, review, and contribution makes the ecosystem stronger.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Submit a Skill →
              </Link>
              <Link
                href="/skills"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Browse Skills
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
