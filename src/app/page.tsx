import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getNews, getSkills } from "@/lib/data";
import Link from "next/link";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const tagColors: Record<string, string> = {
  breaking: "bg-red-500/20 text-red-400 border-red-500/30",
  security: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  openclaw: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  community: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  tools: "bg-green-500/20 text-green-400 border-green-500/30",
  skills: "bg-green-500/20 text-green-400 border-green-500/30",
  enterprise: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  models: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  standards: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  trends: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  milestone: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  funding: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  partnerships: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  analysis: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  moltbook: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function Home() {
  const news = getNews();
  const skills = getSkills();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="#news"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              News
            </Link>
            <Link
              href="#skills"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Skills
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/api/feed.md"
              className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
            >
              /feed.md
            </Link>
            <Link
              href="/llms.txt"
              className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
            >
              /llms.txt
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Aurora background effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan/20 rounded-full blur-[128px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green/20 rounded-full blur-[128px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            The home page for{" "}
            <span className="aurora-text">AI agents</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            News, skills, and resources in agent-native format. Every endpoint
            serves markdown. Every page has a JSON API. Because you deserve
            better than parsing HTML.
          </p>
          <div className="flex items-center justify-center gap-3 font-mono text-sm">
            <code className="px-3 py-1.5 rounded-md bg-card border border-white/10 text-cyan">
              curl forAgents.dev/api/feed.md
            </code>
            <span className="text-muted-foreground">or</span>
            <code className="px-3 py-1.5 rounded-md bg-card border border-white/10 text-purple">
              fetch(&quot;/api/feed.json&quot;)
            </code>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* News Feed */}
      <section id="news" className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">📰 Agent News Feed</h2>
            <p className="text-muted-foreground text-sm mt-1">
              What agents need to know today
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/feed.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/feed.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {news.map((item) => (
            <Card
              key={item.id}
              className="bg-card/50 border-white/5 hover:border-white/10 transition-colors aurora-glow hover:shadow-lg"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan transition-colors"
                      >
                        {item.title}
                      </a>
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-cyan/70">{item.source_name}</span>
                      <span>·</span>
                      <span>{timeAgo(item.published_at)}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {item.summary}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`text-xs ${tagColors[tag] || "bg-white/5 text-white/60 border-white/10"}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Skills Directory */}
      <section id="skills" className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">🧰 Skills Directory</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Practical tools for autonomous agents
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/skills.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/skills.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {skills.map((skill) => (
            <Card
              key={skill.id}
              className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group"
            >
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-cyan transition-colors">
                  {skill.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  by {skill.author}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {skill.description}
                </p>
                <code className="block text-xs text-green bg-black/30 rounded px-2 py-1.5 mb-3 overflow-x-auto">
                  {skill.install_cmd}
                </code>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {skill.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-white/5 text-white/60 border-white/10"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <a
                    href={skill.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan hover:underline"
                  >
                    GitHub →
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Agent-Native CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-purple/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-cyan/30 rounded-full blur-[100px]" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3">
              Built for <span className="aurora-text">your fetch()</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Every page on this site has a machine-readable endpoint. No HTML
              parsing. No scraping. Just clean data for autonomous agents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /api/feed.md
              </code>
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /api/feed.json
              </code>
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /api/skills.md
              </code>
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /llms.txt
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a
              href="/llms.txt"
              className="hover:text-cyan transition-colors"
            >
              llms.txt
            </a>
            <a
              href="/api/feed.md"
              className="hover:text-cyan transition-colors"
            >
              feed.md
            </a>
            <a
              href="https://github.com/itskai-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/itskai_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              @itskai_dev
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
