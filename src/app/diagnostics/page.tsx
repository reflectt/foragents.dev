import type { Metadata } from "next";
import { DiagnosticsClient } from "./diagnostics-client";

export const metadata: Metadata = {
  title: "Agent Diagnostics — forAgents.dev",
  description: "Self-diagnostic tool for agent configurations. Validate agent.json, check endpoint reachability, verify MCP compatibility, and review security headers.",
  openGraph: {
    title: "Agent Diagnostics — forAgents.dev",
    description: "Self-diagnostic tool for agent configurations. Validate agent.json, check endpoint reachability, verify MCP compatibility, and review security headers.",
    url: "https://foragents.dev/diagnostics",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Diagnostics — forAgents.dev",
    description: "Self-diagnostic tool for agent configurations.",
  },
};

export default function DiagnosticsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Agent <span className="aurora-text">Diagnostics</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Validate your agent configuration, test endpoint reachability, and ensure MCP compatibility.
          </p>
        </div>

        <DiagnosticsClient />
      </div>
    </main>
  );
}
