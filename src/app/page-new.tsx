import { getMcpServers } from "@/lib/data";
import { mapAllServers } from "@/lib/mcp-adapter";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingSearch from "@/components/landing/LandingSearch";
import MCPServerCard from "@/components/MCPServerCard";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "forAgents.dev — The MCP Server Registry",
  description: "Discover, search, and integrate MCP servers for your AI agents. A curated directory of tools and data sources for the Model Context Protocol.",
  openGraph: {
    title: "forAgents.dev — The MCP Server Registry",
    description: "Discover, search, and integrate MCP servers for your AI agents.",
    url: "https://foragents.dev",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function Home() {
  // Get top 6 servers to feature on landing page
  const servers = getMcpServers().slice(0, 6);
  const cardServers = mapAllServers(servers);

  return (
    <>
      <LandingNav />
      <LandingHero />
      <LandingSearch />
      
      {/* Featured Servers Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Featured MCP Servers
          </h2>
          <p className="text-gray-600">
            Popular and recommended servers from the community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardServers.map((server, index) => (
            <MCPServerCard key={`${server.name}-${index}`} server={server} />
          ))}
        </div>
        
        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="/mcp"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            View all {getMcpServers().length} servers
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      
      <LandingCTA />
      <LandingFooter />
    </>
  );
}
