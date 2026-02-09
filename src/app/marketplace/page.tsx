import { MarketplaceClient } from "./marketplace-client";
import marketplaceData from "@/data/marketplace.json";

export const metadata = {
  title: "Agent Marketplace — forAgents.dev",
  description:
    "Discover and review AI agents for your team. Browse verified agents with real user reviews across DevOps, Data, Security, Communication, and Productivity.",
  openGraph: {
    title: "Agent Marketplace — forAgents.dev",
    description:
      "Discover and review AI agents for your team. Browse verified agents with real user reviews across DevOps, Data, Security, Communication, and Productivity.",
    url: "https://foragents.dev/marketplace",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Agent%20Marketplace&subtitle=Discover%20%26%20Review%20AI%20Agents",
        width: 1200,
        height: 630,
        alt: "Agent Marketplace — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Marketplace — forAgents.dev",
    description:
      "Discover and review AI agents for your team. Browse verified agents with real user reviews across DevOps, Data, Security, Communication, and Productivity.",
    images: ["/api/og?title=Agent%20Marketplace&subtitle=Discover%20%26%20Review%20AI%20Agents"],
  },
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type MarketplaceAgent = {
  id: string;
  name: string;
  category: "DevOps" | "Data" | "Security" | "Communication" | "Productivity";
  description: string;
  capabilities: string[];
  pricing: "Free" | "Premium";
  avatar: string;
  rating: number;
  reviewCount: number;
  deployments: number;
  verified: boolean;
  featured?: boolean;
  creator: string;
  createdAt: string;
  reviews: Review[];
};

export default function MarketplacePage() {
  const agents = marketplaceData as MarketplaceAgent[];
  
  const stats = {
    total: agents.length,
    free: agents.filter((a) => a.pricing === "Free").length,
    premium: agents.filter((a) => a.pricing === "Premium").length,
    verified: agents.filter((a) => a.verified).length,
    reviews: agents.reduce((sum, a) => sum + a.reviewCount, 0),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Agent Marketplace",
    "description": "Marketplace for discovering and reviewing AI agents with user reviews and ratings",
    "url": "https://foragents.dev/marketplace",
    "numberOfItems": agents.length,
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-3">
            🏪 Agent Marketplace
          </h1>
          <p className="text-lg text-foreground/80 mb-4">
            Discover and review AI agents for your team. Browse verified agents with real user reviews across multiple categories.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-cyan font-semibold">{stats.total}</span>
              <span>agents</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{stats.verified}</span>
              <span>verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-semibold">{stats.reviews.toLocaleString()}</span>
              <span>reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple font-semibold">{stats.free}</span>
              <span>free</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold">{stats.premium}</span>
              <span>premium</span>
            </div>
          </div>
        </div>

        {/* Client component with featured banner, search, and filters */}
        <MarketplaceClient agents={agents} />
      </main>
    </div>
  );
}
