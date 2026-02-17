import Link from 'next/link';

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href="/"
            className="text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            forAgents.dev
          </Link>
          
          {/* Nav Links */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link
                href="/mcp"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Browse
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Docs
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Blog
              </Link>
            </li>
          </ul>
          
          {/* CTA Button */}
          <Link
            href="/mcp"
            className="inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5"
          >
            Explore MCP Servers
          </Link>
        </div>
      </div>
    </nav>
  );
}
