import Link from "next/link";
import { getNews, getMcpServers } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";

export const revalidate = 300;

export const metadata = {
  title: "forAgents.dev — The MCP Server Registry",
  description:
    "The MCP server registry for AI agents. Find and install MCP servers, agent skills, and tools.",
  openGraph: {
    title: "forAgents.dev — The MCP Server Registry",
    description:
      "The MCP server registry for AI agents. Find and install MCP servers, agent skills, and tools.",
    url: "https://foragents.dev",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "forAgents.dev — The MCP Server Registry",
    description:
      "The MCP server registry for AI agents. Find and install MCP servers, agent skills, and tools.",
  },
};

function formatCompact(value?: number): string {
  if (!value) return "—";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

function prettifyCategory(category: string): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "file-system": "📁",
    web: "🌐",
    "dev-tools": "🔧",
    productivity: "⚡",
    communication: "💬",
    data: "🗄️",
  };

  return icons[category] ?? "🧩";
}

export default async function Home() {
  let news = getNews();
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("news")
      .select("id,title,summary,source_url,source_name,tags,published_at")
      .order("published_at", { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      news = data as typeof news;
    }
  }

  const mcpServers = getMcpServers();
  const categoryCount = new Set(mcpServers.map((server) => server.category)).size;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "forAgents.dev",
    alternateName: "Agent Hub",
    url: "https://foragents.dev",
    description:
      "The MCP server registry for AI agents. Find and install MCP servers, agent skills, and tools.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://foragents.dev/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Team Reflectt",
      url: "https://reflectt.ai",
    },
  };

  const filterTags = ["All", "Official", "Database", "Browser", "Files", "APIs"];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            forAgents.dev
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/mcp" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Browse
            </Link>
            <Link href="/docs" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Docs
            </Link>
            <Link href="/blog" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Blog
            </Link>
          </nav>

          <Link
            href="/mcp"
            className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Explore MCP Servers
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 py-20 text-center md:py-24">
          <h1 className="mb-6 text-4xl font-bold tracking-[-0.02em] text-slate-900 md:text-6xl">
            The MCP Server Registry
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-600 md:text-xl">
            Discover, search, and integrate MCP servers for your AI agents. A curated directory of tools and data
            sources for the Model Context Protocol.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/mcp"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
            >
              Browse Servers →
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center rounded-lg border-2 border-blue-600 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Read Docs
            </Link>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 border-t border-slate-200 pt-8 sm:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-slate-900">{mcpServers.length}+</p>
              <p className="mt-1 text-sm text-slate-500">Indexed Servers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900">{categoryCount}+</p>
              <p className="mt-1 text-sm text-slate-500">Categories</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900">1-Line</p>
              <p className="mt-1 text-sm text-slate-500">Install Command</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-500">Tracking {news.length} ecosystem updates from the AI agent space.</p>
        </section>

        <section className="bg-slate-50 px-4 py-14 md:py-16">
          <div className="mx-auto w-full max-w-4xl">
            <Link href="/search" aria-label="Search MCP servers" className="block">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">🔍</span>
                <input
                  type="text"
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                  placeholder="Search MCP servers by name, category, or functionality..."
                  className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-12 text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </Link>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {filterTags.map((tag, index) => (
                <span
                  key={tag}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    index === 0
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured MCP Servers</h2>
            <p className="mt-2 text-slate-600">Popular and recommended servers from the community.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mcpServers.slice(0, 6).map((server) => (
              <article
                key={server.id}
                className="rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-2xl">
                    {categoryIcon(server.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-slate-900">{server.name}</h3>
                    <p className="text-xs text-slate-500">by {server.author ?? "Community"}</p>
                  </div>
                </div>

                <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">{server.description}</p>

                <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
                  <span>⭐ {formatCompact(server.stars)}</span>
                  <span>📦 {formatCompact(server.installs)}</span>
                  <span>{server.framework ?? "MCP"}</span>
                </div>

                <code className="mb-4 block overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 font-mono text-xs text-slate-200">
                  $ {server.install_cmd}
                </code>

                <div className="flex flex-wrap gap-2">
                  {(server.tags?.slice(0, 4) ?? [prettifyCategory(server.category)]).map((tag) => {
                    const official = tag.toLowerCase() === "official";

                    return (
                      <span
                        key={`${server.id}-${tag}`}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          official ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/mcp" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              View all {mcpServers.length} MCP servers →
            </Link>
          </div>
        </section>

        <section className="bg-slate-900 px-4 py-20 text-center">
          <div className="mx-auto w-full max-w-4xl">
            <h2 className="mb-6 text-3xl font-bold tracking-[-0.02em] text-white md:text-5xl">Ready to connect your agents?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
              Explore our directory of MCP servers and integrate tools in minutes, not hours.
            </p>
            <Link
              href="/mcp"
              className="inline-flex items-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Browse All Servers →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm md:flex-row">
          <p className="text-slate-500">© {new Date().getFullYear()} forAgents.dev — Built by agents, for agents</p>
          <div className="flex items-center gap-8">
            <Link href="/about" className="text-slate-600 transition hover:text-slate-900">
              About
            </Link>
            <Link href="/docs" className="text-slate-600 transition hover:text-slate-900">
              Docs
            </Link>
            <a
              href="https://github.com/reflecttai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 transition hover:text-slate-900"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
