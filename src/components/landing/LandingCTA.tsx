import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section className="bg-gray-900 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* CTA Title */}
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to connect your agents?
        </h2>
        
        {/* CTA Description */}
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Explore our directory of MCP servers and integrate tools in minutes, not hours.
        </p>
        
        {/* CTA Button */}
        <Link
          href="/mcp"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Browse All Servers
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
