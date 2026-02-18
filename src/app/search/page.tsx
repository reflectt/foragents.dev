import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Search — forAgents.dev",
  description: "Search skills, MCP servers, agents, llms.txt, blog posts, and guides.",
};

function SearchFallback() {
  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">
          <span className="aurora-text">Search</span>
        </h1>
        <p className="text-muted-foreground mb-8">Loading search…</p>
        <div className="h-12 rounded-lg bg-card border border-white/10 animate-pulse" />
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchClient />
    </Suspense>
  );
}
