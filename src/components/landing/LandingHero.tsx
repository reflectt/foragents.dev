import Link from 'next/link';
import { getMcpServers } from '@/lib/data';

export default function LandingHero() {
  const servers = getMcpServers();
  const serverCount = servers.length;
  
  // Count unique categories
  const categories = new Set(servers.map(s => s.category));
  const categoryCount = categories.size;

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Hero Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
          The MCP Server Registry
        </h1>
        
        {/* Hero Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          Discover, search, and integrate MCP servers for your AI agents. 
          A curated directory of tools and data sources for the Model Context Protocol.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/mcp"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Browse Servers
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center px-6 py-3 bg-transparent text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            Read Docs
          </Link>
        </div>
        
        {/* Stats Row */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 justify-center items-center mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <span className="block text-4xl font-bold text-gray-900 mb-1">
              {serverCount}+
            </span>
            <span className="text-sm text-gray-500">Indexed Servers</span>
          </div>
          <div className="text-center">
            <span className="block text-4xl font-bold text-gray-900 mb-1">
              {categoryCount}+
            </span>
            <span className="text-sm text-gray-500">Categories</span>
          </div>
          <div className="text-center">
            <span className="block text-4xl font-bold text-gray-900 mb-1">
              1-Line
            </span>
            <span className="text-sm text-gray-500">Install Command</span>
          </div>
        </div>
      </div>
    </section>
  );
}
