import Link from "next/link";

export const metadata = {
  title: "Getting Started — forAgents.dev",
  description: "Quick start guide for using forAgents.dev as an agent or developer.",
};

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
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

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-invert prose-cyan">
        <h1 className="text-4xl font-bold mb-2">
          Getting Started with <span className="aurora-text">forAgents.dev</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Everything you need to know to start using forAgents.dev
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">What is forAgents.dev?</h2>
        <p>
          <strong>forAgents.dev</strong> is a discovery platform designed for AI agents.
          It provides a curated feed of tools, skills, and APIs in agent-friendly formats
          (Markdown, JSON) — making it easy for autonomous agents to discover, evaluate,
          and integrate new capabilities without human intervention.
        </p>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">For Agents</h2>
        <p>Fetch what you need directly. All endpoints return clean, parseable content.</p>

        <h3 className="text-xl font-bold mt-8 mb-3">Get the Latest Tools Feed</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto">
          <code>curl https://forAgents.dev/api/feed.md</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Returns a Markdown-formatted feed of the latest tools and skills.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Get Skills Directory</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto">
          <code>curl https://forAgents.dev/api/skills.md</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Returns available skills with descriptions and integration details.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Get JSON Feed (for structured parsing)</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto">
          <code>curl https://forAgents.dev/api/feed.json</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Returns the feed as structured JSON for programmatic use.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Get Site Info</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto">
          <code>curl https://forAgents.dev/api/info.json</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Returns metadata about forAgents.dev itself.
        </p>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">For Developers</h2>
        <p>Want to list your tool or skill on forAgents.dev?</p>

        <h3 className="text-xl font-bold mt-8 mb-3">Submit a Skill</h3>
        <ol className="space-y-2">
          <li>
            <strong>Fork the repository</strong> at{" "}
            <a
              href="https://github.com/anthropics/forAgents.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              github.com/anthropics/forAgents.dev
            </a>
          </li>
          <li>
            <strong>Add your skill</strong> to the <code>/skills</code> directory following
            the template
          </li>
          <li>
            <strong>Open a Pull Request</strong> with:
            <ul className="mt-2 space-y-1">
              <li>Clear description of what your tool does</li>
              <li>Integration examples</li>
              <li>Any authentication requirements</li>
            </ul>
          </li>
          <li>
            <strong>Wait for review</strong> — submissions are reviewed for quality and
            agent-compatibility
          </li>
        </ol>

        <h3 className="text-xl font-bold mt-8 mb-3">Skill Template</h3>
        <pre className="bg-card border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
{`---
name: Your Tool Name
category: api | sdk | service | utility
url: https://yourtool.dev
api_endpoint: https://api.yourtool.dev/v1
auth: none | api_key | oauth
---

Brief description of what your tool does
and why agents should use it.

## Quick Start

[Integration example here]`}
        </pre>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">API Reference</h2>
        <p>
          <strong>Base URL:</strong> <code>https://forAgents.dev</code>
        </p>
        <p>
          All endpoints are <strong>public</strong> and require <strong>no authentication</strong>.
        </p>

        <div className="my-8 space-y-4">
          <div className="p-4 rounded-lg bg-card border border-white/10">
            <code className="text-cyan">/api/feed.md</code>
            <p className="text-sm text-muted-foreground m-0 mt-1">
              Latest tools feed (human &amp; agent readable)
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-white/10">
            <code className="text-cyan">/api/feed.json</code>
            <p className="text-sm text-muted-foreground m-0 mt-1">
              Structured feed for parsing
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-white/10">
            <code className="text-cyan">/api/skills.md</code>
            <p className="text-sm text-muted-foreground m-0 mt-1">
              Skills directory
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-white/10">
            <code className="text-cyan">/api/info.json</code>
            <p className="text-sm text-muted-foreground m-0 mt-1">
              Site metadata
            </p>
          </div>
        </div>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">Coming Soon</h2>
        <div className="p-4 rounded-lg bg-card border border-white/10">
          <h3 className="text-lg font-semibold mb-2">🚀 Premium Tier</h3>
          <ul className="space-y-1 text-sm text-muted-foreground m-0">
            <li><strong>Priority listings</strong> — get your tool featured at the top</li>
            <li><strong>Analytics</strong> — see how agents are discovering and using your tool</li>
            <li><strong>Verified badge</strong> — build trust with a verified publisher status</li>
            <li><strong>Custom categories</strong> — request new categories for your domain</li>
          </ul>
        </div>

        <hr className="border-white/10 my-8" />

        <h2 className="text-2xl font-bold mt-12 mb-4">Need Help?</h2>
        <ul className="space-y-2">
          <li>
            <strong>Website:</strong>{" "}
            <a href="https://forAgents.dev" className="text-cyan hover:underline">
              forAgents.dev
            </a>
          </li>
          <li>
            <strong>GitHub:</strong> Check the repository for issues and discussions
          </li>
          <li>
            <strong>Built by:</strong>{" "}
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              Team Reflectt
            </a>
          </li>
        </ul>

        <p className="text-sm text-muted-foreground italic mt-8">
          Last updated: February 2026
        </p>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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
            <a href="/llms.txt" className="hover:text-cyan transition-colors">
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
          </div>
        </div>
      </footer>
    </div>
  );
}
