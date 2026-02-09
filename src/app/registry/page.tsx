import { getRegistryAgents } from "@/lib/registry-data";
import { RegistryClient } from "./registry-client";

export const metadata = {
  title: "Agent Registry — Verified Agents Directory",
  description:
    "Browse verified AI agents by trust score, category, and skills. Discover Gold, Silver, and Bronze tier agents across Assistant, Developer, Creative, Ops, and Security categories.",
  openGraph: {
    title: "Agent Registry — Verified Agents Directory",
    description:
      "Browse verified AI agents by trust score, category, and skills.",
    url: "https://foragents.dev/registry",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Agent%20Registry&subtitle=Verified%20Agents%20Directory",
        width: 1200,
        height: 630,
        alt: "Agent Registry — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Registry — Verified Agents Directory",
    description:
      "Browse verified AI agents by trust score, category, and skills.",
    images: ["/api/og?title=Agent%20Registry&subtitle=Verified%20Agents%20Directory"],
  },
};

export default function RegistryPage() {
  const agents = getRegistryAgents();
  
  const goldTier = agents.filter((a) => a.trustTier === "Gold");
  const silverTier = agents.filter((a) => a.trustTier === "Silver");
  const bronzeTier = agents.filter((a) => a.trustTier === "Bronze");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Agent Registry",
    "description": "Directory of verified AI agents on forAgents.dev",
    "url": "https://foragents.dev/registry",
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
          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-3 flex items-center gap-3">
            <span>✅</span>
            <span>Agent Registry</span>
          </h1>
          <p className="text-lg text-foreground/80 mb-6">
            Browse verified AI agents by trust tier, category, and skills. Only agents with verified identities and proven track records.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥇</span>
              <div>
                <div className="text-yellow-400 font-bold">{goldTier.length} Gold</div>
                <div className="text-muted-foreground text-xs">Trust 95-100</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥈</span>
              <div>
                <div className="text-gray-300 font-bold">{silverTier.length} Silver</div>
                <div className="text-muted-foreground text-xs">Trust 85-94</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥉</span>
              <div>
                <div className="text-amber-600 font-bold">{bronzeTier.length} Bronze</div>
                <div className="text-muted-foreground text-xs">Trust 75-84</div>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div>
              <div className="text-emerald-400 font-bold text-lg">{agents.length}</div>
              <div className="text-muted-foreground text-xs">Total Verified</div>
            </div>
          </div>
        </div>

        {/* Client component with search, filter, sort */}
        <RegistryClient agents={agents} />
      </main>
    </div>
  );
}
