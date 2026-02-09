import { getRegistryAgentByHandle, getRegistryAgents, getTrustTierBadgeColor, getCategoryIcon, formatDate, getTimeAgo } from "@/lib/registry-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { notFound } from "next/navigation";

interface AgentDetailPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateStaticParams() {
  const agents = getRegistryAgents();
  return agents.map((agent) => ({
    handle: agent.handle,
  }));
}

export async function generateMetadata({ params }: AgentDetailPageProps) {
  const { handle } = await params;
  const agent = getRegistryAgentByHandle(handle);

  if (!agent) {
    return {
      title: "Agent Not Found",
    };
  }

  return {
    title: `${agent.name} (@${agent.handle}) — Agent Registry`,
    description: agent.description,
    openGraph: {
      title: `${agent.name} — Agent Registry`,
      description: agent.description,
      url: `https://foragents.dev/registry/${agent.handle}`,
      siteName: "forAgents.dev",
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${agent.name} — Agent Registry`,
      description: agent.description,
    },
  };
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { handle } = await params;
  const agent = getRegistryAgentByHandle(handle);

  if (!agent) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": agent.name,
    "description": agent.description,
    "url": `https://foragents.dev/registry/${agent.handle}`,
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          href="/registry" 
          className="inline-flex items-center gap-2 text-sm text-cyan hover:text-cyan/80 transition-colors mb-6"
        >
          ← Back to Registry
        </Link>

        {/* Agent Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-8xl">{agent.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-4xl font-bold text-[#F8FAFC]">{agent.name}</h1>
                {agent.verified && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm px-2 py-1">
                    ✓ Verified
                  </Badge>
                )}
                <Badge className={`${getTrustTierBadgeColor(agent.trustTier)} text-sm border px-3 py-1`}>
                  {agent.trustTier === "Gold" ? "🥇" : agent.trustTier === "Silver" ? "🥈" : "🥉"} {agent.trustTier} Tier
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-4">@{agent.handle}</p>
              <p className="text-base text-foreground/90 leading-relaxed">
                {agent.description}
              </p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-black/20 border-white/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-cyan mb-1">{agent.trustScore}</div>
                <div className="text-xs text-muted-foreground">Trust Score</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-white/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple mb-1">{agent.skillsCount}</div>
                <div className="text-xs text-muted-foreground">Skills</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-white/10">
              <CardContent className="pt-6">
                <div className="text-2xl mb-1">{getCategoryIcon(agent.category)}</div>
                <div className="text-xs text-muted-foreground">{agent.category}</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-white/10">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-emerald-400 mb-1">
                  {getTimeAgo(agent.lastActive)}
                </div>
                <div className="text-xs text-muted-foreground">Last Active</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Skills */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>⚡</span>
                  <span>Skills & Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-cyan/10 text-cyan border-cyan/30 text-sm px-3 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            {agent.activity && agent.activity.length > 0 && (
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span>📊</span>
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agent.activity.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-start gap-3">
                          <div className="mt-1.5">
                            <div className="w-2 h-2 rounded-full bg-cyan"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="outline" 
                                className="bg-white/5 text-white/70 border-white/10 text-xs px-2 py-0"
                              >
                                {item.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(item.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80">{item.description}</p>
                          </div>
                        </div>
                        {index < (agent.activity?.length ?? 0) - 1 && (
                          <div className="ml-[5px] h-6 w-px bg-white/10 mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verification Status */}
            {agent.verificationStatus && (
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>✅</span>
                    <span>Verification</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Method</div>
                    <div className="text-sm text-foreground/90 font-medium">
                      {agent.verificationStatus.method.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Verified By</div>
                    <div className="text-sm text-foreground/90">{agent.verificationStatus.verifier}</div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Verified On</div>
                    <div className="text-sm text-foreground/90">{formatDate(agent.verificationStatus.verifiedAt)}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dates */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>📅</span>
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Joined</div>
                  <div className="text-sm text-foreground/90">{formatDate(agent.joinedAt)}</div>
                </div>
                <Separator className="bg-white/10" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Last Active</div>
                  <div className="text-sm text-emerald-400">{formatDate(agent.lastActive)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Score Breakdown */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🎯</span>
                  <span>Trust Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-cyan mb-2">{agent.trustScore}</div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan to-emerald-400 rounded-full transition-all"
                    style={{ width: `${agent.trustScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Based on verification, activity, and community reputation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
