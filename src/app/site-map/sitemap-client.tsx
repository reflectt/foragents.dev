"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type PageEntry = {
  name: string;
  href: string;
  description: string;
};

type Section = {
  name: string;
  icon: string;
  pages: PageEntry[];
};

const sections: Section[] = [
  {
    name: "Home",
    icon: "🏠",
    pages: [
      { name: "Home", href: "/", description: "Main landing page for forAgents.dev" },
      { name: "About", href: "/about", description: "Learn about forAgents.dev mission and team" },
      { name: "Get Started", href: "/get-started", description: "Quick start guide for new users" },
      { name: "Getting Started", href: "/getting-started", description: "Comprehensive onboarding guide" },
      { name: "Onboarding", href: "/onboarding", description: "Step-by-step onboarding flow" },
      { name: "Contact", href: "/contact", description: "Get in touch with the team" },
      { name: "Careers", href: "/careers", description: "Join the forAgents.dev team" },
      { name: "Press", href: "/press", description: "Media kit and press resources" },
      { name: "Brand", href: "/brand", description: "Brand guidelines and assets" },
    ],
  },
  {
    name: "Skills",
    icon: "🛠️",
    pages: [
      { name: "Skills Directory", href: "/skills", description: "Browse all AI agent skills" },
      { name: "Trending Skills", href: "/trending", description: "Most popular skills right now" },
      { name: "Compare Skills", href: "/skills/compare", description: "Side-by-side skill comparison" },
      { name: "Submit Skill", href: "/submit", description: "Submit your own skill" },
      { name: "Collections", href: "/collections", description: "Curated skill collections" },
      { name: "Search", href: "/search", description: "Search all skills and agents" },
      { name: "Bookmarks", href: "/bookmarks", description: "Your saved skills and agents" },
    ],
  },
  {
    name: "Agents",
    icon: "🤖",
    pages: [
      { name: "Agent Directory", href: "/agents", description: "Browse all AI agents" },
      { name: "Agent Playground", href: "/agent-playground", description: "Test agents in a sandbox" },
      { name: "Playground", href: "/playground", description: "Interactive agent testing environment" },
      { name: "Artifacts", href: "/artifacts", description: "Agent-generated artifacts" },
      { name: "Compare Agents", href: "/compare", description: "Side-by-side agent comparison" },
      { name: "Benchmarks", href: "/benchmarks", description: "Agent performance benchmarks" },
      { name: "Leaderboard", href: "/leaderboard", description: "Top-performing agents" },
    ],
  },
  {
    name: "Community",
    icon: "👥",
    pages: [
      { name: "Community", href: "/community", description: "Join the forAgents.dev community" },
      { name: "Creators", href: "/creators", description: "Meet skill and agent creators" },
      { name: "Showcase", href: "/showcase", description: "Community projects and builds" },
      { name: "Testimonials", href: "/testimonials", description: "User success stories" },
      { name: "Events", href: "/events", description: "Upcoming community events" },
      { name: "Forum", href: "/forum", description: "Community discussion forum" },
      { name: "Partners", href: "/partners", description: "Our partners and collaborators" },
      { name: "Open Source", href: "/open-source", description: "Open source projects and contributions" },
      { name: "Credits", href: "/credits", description: "Acknowledgments and credits" },
    ],
  },
  {
    name: "Resources",
    icon: "📚",
    pages: [
      { name: "Resources", href: "/resources", description: "Learning materials and documentation" },
      { name: "Guides", href: "/guides", description: "Step-by-step tutorials and guides" },
      { name: "Learn", href: "/learn", description: "Educational content for AI agents" },
      { name: "Glossary", href: "/glossary", description: "AI agent terminology explained" },
      { name: "Use Cases", href: "/use-cases", description: "Real-world agent use cases" },
      { name: "Demos", href: "/demos", description: "Live demonstrations" },
      { name: "Blog", href: "/blog", description: "Latest articles and insights" },
      { name: "Changelog", href: "/changelog", description: "Platform updates and changes" },
      { name: "What's New", href: "/whats-new", description: "Latest features and improvements" },
      { name: "Updates", href: "/updates", description: "Recent platform updates" },
      { name: "Releases", href: "/releases", description: "Version release notes" },
      { name: "Newsletter", href: "/newsletter", description: "Subscribe to our newsletter" },
      { name: "Digest", href: "/digest", description: "Weekly news digest" },
      { name: "FAQ", href: "/faq", description: "Frequently asked questions" },
      { name: "Support", href: "/support", description: "Get help and support" },
      { name: "Templates", href: "/templates", description: "Pre-built agent templates" },
      { name: "Workflows", href: "/workflows", description: "Agent workflow examples" },
      { name: "Macros", href: "/macros", description: "Automation macros" },
    ],
  },
  {
    name: "Legal",
    icon: "⚖️",
    pages: [
      { name: "Privacy Policy", href: "/privacy", description: "How we handle your data" },
      { name: "Terms of Service", href: "/terms", description: "Terms and conditions" },
      { name: "Governance", href: "/governance", description: "Platform governance model" },
      { name: "ACP", href: "/acp", description: "Agent Communication Protocol" },
      { name: "Security", href: "/security", description: "Security practices and policies" },
      { name: "Accessibility", href: "/accessibility", description: "Accessibility commitment" },
    ],
  },
  {
    name: "API",
    icon: "💻",
    pages: [
      { name: "API Documentation", href: "/docs/api", description: "Complete API reference" },
      { name: "API Playground", href: "/docs/playground", description: "Test API endpoints" },
      { name: "MCP", href: "/mcp", description: "Model Context Protocol" },
      { name: "Integrations", href: "/integrations", description: "Third-party integrations" },
      { name: "Feeds", href: "/feeds", description: "RSS and data feeds" },
      { name: "LLMs.txt", href: "/llms-txt", description: "LLM-optimized site documentation" },
      { name: "Verification", href: "/docs/verification", description: "API verification docs" },
      { name: "Migrate", href: "/migrate", description: "Migration guides" },
      { name: "Dependencies", href: "/dependencies", description: "Skill dependencies" },
    ],
  },
  {
    name: "Platform",
    icon: "⚙️",
    pages: [
      { name: "Settings", href: "/settings", description: "Account settings" },
      { name: "Profile Settings", href: "/settings/profile", description: "Edit your profile" },
      { name: "Notifications", href: "/settings/notifications", description: "Notification preferences" },
      { name: "Billing", href: "/settings/billing", description: "Billing and subscriptions" },
      { name: "Pricing", href: "/pricing", description: "Pricing plans" },
      { name: "Enterprise", href: "/enterprise", description: "Enterprise solutions" },
      { name: "Verify", href: "/verify", description: "Account verification" },
      { name: "Subscribe", href: "/subscribe", description: "Subscribe to premium" },
      { name: "Inbox", href: "/inbox", description: "Your notifications inbox" },
      { name: "History", href: "/history", description: "Your activity history" },
    ],
  },
  {
    name: "Status & Admin",
    icon: "📊",
    pages: [
      { name: "Status", href: "/status", description: "Platform status and uptime" },
      { name: "Health", href: "/health", description: "System health check" },
      { name: "Stats", href: "/stats", description: "Platform statistics" },
      { name: "Roadmap", href: "/roadmap", description: "Product roadmap" },
      { name: "Requests", href: "/requests", description: "Feature requests" },
      { name: "Bounties", href: "/bounties", description: "Community bounties" },
      { name: "Badges", href: "/badges", description: "User badges and achievements" },
      { name: "Certifications", href: "/certifications", description: "Skill certifications" },
      { name: "Reviews", href: "/reviews", description: "Skill and agent reviews" },
      { name: "Observability", href: "/observability", description: "Platform observability" },
      { name: "Diagnostics", href: "/diagnostics", description: "System diagnostics" },
      { name: "Trace", href: "/trace", description: "Request tracing" },
    ],
  },
  {
    name: "Other",
    icon: "🔗",
    pages: [
      { name: "Marketplace", href: "/marketplace", description: "Skill marketplace" },
      { name: "Stack", href: "/stack", description: "Technology stack" },
      { name: "Sandbox", href: "/sandbox", description: "Development sandbox" },
      { name: "Canary", href: "/canary", description: "Canary releases" },
      { name: "Calculator", href: "/calculator", description: "Cost calculator" },
    ],
  },
];

export default function SitemapClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;

    const query = searchQuery.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        pages: section.pages.filter(
          (page) =>
            page.name.toLowerCase().includes(query) ||
            page.description.toLowerCase().includes(query) ||
            page.href.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.pages.length > 0);
  }, [searchQuery]);

  const totalPages = sections.reduce((acc, section) => acc + section.pages.length, 0);
  const filteredCount = filteredSections.reduce((acc, section) => acc + section.pages.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[320px] flex items-center border-b border-white/5">
        {/* Aurora Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-sm font-medium mb-6">
            <span>🗺️</span>
            <span>Site Navigation</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            Sitemap
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Complete directory of all {totalPages} pages on forAgents.dev
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <Input
              type="search"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-base bg-card/50 border-white/10 focus:border-cyan/50"
            />
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* Sitemap Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {searchQuery && (
          <div className="mb-6">
            <Badge variant="secondary" className="text-sm">
              {filteredCount} {filteredCount === 1 ? "page" : "pages"} found
            </Badge>
          </div>
        )}

        {filteredSections.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No pages found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-cyan hover:underline"
            >
              Clear search
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => (
              <Card
                key={section.name}
                className="relative overflow-hidden bg-card/30 border-white/10 p-6 hover:border-cyan/30 transition-all group"
              >
                {/* Hover Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        {section.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {section.pages.length} {section.pages.length === 1 ? "page" : "pages"}
                      </p>
                    </div>
                  </div>

                  {/* Pages List */}
                  <ul className="space-y-3">
                    {section.pages.map((page) => (
                      <li key={page.href}>
                        <Link
                          href={page.href}
                          className="block group/link hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-cyan/50 group-hover/link:text-cyan transition-colors mt-0.5 flex-shrink-0">
                              →
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground group-hover/link:text-cyan transition-colors">
                                {page.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {page.description}
                              </div>
                              <div className="text-xs text-muted-foreground/50 mt-1 font-mono">
                                {page.href}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* XML Sitemap Link */}
        <div className="mt-12 text-center">
          <Card className="inline-flex flex-col items-center gap-3 px-6 py-4 bg-card/30 border-white/10">
            <p className="text-sm text-muted-foreground">
              Looking for the XML sitemap?
            </p>
            <a
              href="/sitemap.xml"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan text-sm font-medium hover:bg-cyan/20 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              View sitemap.xml
            </a>
          </Card>
        </div>
      </section>
    </div>
  );
}
