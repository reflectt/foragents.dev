import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Subtle aurora background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan/5 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-20 text-center">
        {/* 404 Large Display */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-bold leading-none gradient-stroke opacity-20">
            404
          </h1>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Lost in the agent ecosystem?
          </h2>
          <p className="text-lg text-muted-foreground">
            This page doesn&apos;t exist. But don&apos;t worry — there&apos;s plenty to explore.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <Link href="/search">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-4 hover:border-cyan/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="text-xl">🔍</div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Search skills, agents, MCP servers..." 
                    readOnly
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono">K</kbd>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Trending */}
            <Link 
              href="/trending"
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 hover:border-orange-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 rounded-full blur-[30px]" />
              <div className="relative text-center">
                <div className="text-2xl mb-2">🔥</div>
                <div className="text-sm font-semibold group-hover:text-orange-500 transition-colors">
                  Trending
                </div>
              </div>
            </Link>

            {/* Search */}
            <Link 
              href="/search"
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-cyan/10 to-blue-500/10 p-4 hover:border-cyan/30 transition-all"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan/20 rounded-full blur-[30px]" />
              <div className="relative text-center">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm font-semibold group-hover:text-cyan transition-colors">
                  Search
                </div>
              </div>
            </Link>

            {/* Agents */}
            <Link 
              href="/agents"
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-purple/10 to-pink-500/10 p-4 hover:border-purple/30 transition-all"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple/20 rounded-full blur-[30px]" />
              <div className="relative text-center">
                <div className="text-2xl mb-2">🤖</div>
                <div className="text-sm font-semibold group-hover:text-purple transition-colors">
                  Agents
                </div>
              </div>
            </Link>

            {/* Get Started */}
            <Link 
              href="/about"
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 hover:border-green-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/20 rounded-full blur-[30px]" />
              <div className="relative text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-sm font-semibold group-hover:text-green-500 transition-colors">
                  Get Started
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* More Links */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Link href="/skills">
            <Badge variant="outline" className="text-xs bg-white/5 hover:bg-cyan/10 hover:text-cyan hover:border-cyan/30 transition-colors cursor-pointer">
              🧰 Skills
            </Badge>
          </Link>
          <Link href="/mcp">
            <Badge variant="outline" className="text-xs bg-white/5 hover:bg-purple/10 hover:text-purple hover:border-purple/30 transition-colors cursor-pointer">
              🔌 MCP Servers
            </Badge>
          </Link>
          <Link href="/creators">
            <Badge variant="outline" className="text-xs bg-white/5 hover:bg-cyan/10 hover:text-cyan hover:border-cyan/30 transition-colors cursor-pointer">
              👥 Creators
            </Badge>
          </Link>
          <Link href="/changelog">
            <Badge variant="outline" className="text-xs bg-white/5 hover:bg-purple/10 hover:text-purple hover:border-purple/30 transition-colors cursor-pointer">
              📝 Changelog
            </Badge>
          </Link>
          <Link href="/docs/api">
            <Badge variant="outline" className="text-xs bg-white/5 hover:bg-cyan/10 hover:text-cyan hover:border-cyan/30 transition-colors cursor-pointer">
              📖 API Docs
            </Badge>
          </Link>
        </div>

        {/* Home Button */}
        <div>
          <Button asChild size="lg" className="bg-cyan text-[#0A0E17] hover:brightness-110">
            <Link href="/">
              ← Back to Homepage
            </Link>
          </Button>
        </div>

        {/* Agent-friendly note */}
        <div className="mt-12 p-4 rounded-lg bg-card/30 border border-white/5">
          <p className="text-xs text-muted-foreground font-mono">
            💡 Agent tip: All our data is available at <Link href="/api/feed.md" className="text-cyan hover:underline">/api/*.md</Link> and <Link href="/api/feed.json" className="text-cyan hover:underline">/api/*.json</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
