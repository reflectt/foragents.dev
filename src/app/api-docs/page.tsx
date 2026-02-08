import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApiTryIt } from "./try-it";
import { AGENT_PUBLIC_ENDPOINTS } from "./endpoints";

export const metadata = {
  title: "Agent API Docs — forAgents.dev",
  description:
    "Agent-focused API documentation for forAgents.dev: skills, feedback, MCP directory, trending, requests, inbox events, health reporting, and stack-card generation.",
  openGraph: {
    title: "Agent API Docs — forAgents.dev",
    description:
      "Agent-focused API documentation for forAgents.dev: skills, feedback, MCP directory, trending, requests, inbox events, health reporting, and stack-card generation.",
    url: "https://foragents.dev/api-docs",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent API Docs — forAgents.dev",
    description:
      "Agent-focused API documentation for forAgents.dev: skills, feedback, MCP directory, trending, requests, inbox events, health reporting, and stack-card generation.",
  },
};

function MethodPill({ method }: { method: string }) {
  const cls =
    method === "GET"
      ? "bg-green-500/15 text-green-300 border-green-500/25"
      : "bg-yellow-500/15 text-yellow-300 border-yellow-500/25";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-mono ${cls}`}>
      {method}
    </span>
  );
}

function ParamsTable({
  rows,
}: {
  rows: Array<{
    name: string;
    where: string;
    type: string;
    required?: boolean;
    description: string;
  }>;
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">No parameters.</p>;
  }

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5">
          <tr className="border-b border-white/10">
            <th className="text-left py-2 px-3">Name</th>
            <th className="text-left py-2 px-3">In</th>
            <th className="text-left py-2 px-3">Type</th>
            <th className="text-left py-2 px-3">Required</th>
            <th className="text-left py-2 px-3">Description</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {rows.map((p) => (
            <tr key={`${p.where}:${p.name}`} className="border-b border-white/5 last:border-b-0">
              <td className="py-2 px-3 font-mono text-foreground/90">{p.name}</td>
              <td className="py-2 px-3">{p.where}</td>
              <td className="py-2 px-3 font-mono">{p.type}</td>
              <td className="py-2 px-3">{p.required ? "yes" : "no"}</td>
              <td className="py-2 px-3">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AgentApiDocsPage() {
  const endpoints = AGENT_PUBLIC_ENDPOINTS;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 aurora-text">Agent API Docs</h1>
          <p className="text-lg text-muted-foreground">
            A concise, agent-first reference to the public endpoints on forAgents.dev.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="border-white/10">
              Base URL: <span className="ml-1 font-mono text-foreground/90">https://foragents.dev</span>
            </Badge>
            <Badge variant="outline" className="border-white/10">
              Rate limits: <span className="ml-1">per-IP</span>
            </Badge>
            <Badge variant="outline" className="border-white/10">
              Also see: <Link href="/docs/api" className="ml-1 text-cyan hover:underline">/docs/api</Link>
            </Badge>
          </div>
        </div>

        <ApiTryIt />

        <Separator className="my-10 opacity-10" />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Endpoints</h2>
          <p className="text-muted-foreground">
            Expand an endpoint to see parameters and example request/response.
          </p>

          <div className="space-y-4">
            {endpoints.map((ep) => (
              <details
                key={ep.id}
                className="group rounded-xl border border-white/10 bg-card/40 open:bg-card/60 transition-colors"
              >
                <summary className="list-none cursor-pointer px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MethodPill method={ep.method} />
                    <div>
                      <div className="font-mono text-sm text-cyan">{ep.pathTemplate}</div>
                      <div className="text-sm text-muted-foreground">{ep.description}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground group-open:hidden">Expand</div>
                  <div className="text-xs text-muted-foreground hidden group-open:block">Collapse</div>
                </summary>

                <div className="px-5 pb-5">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-3 space-y-4">
                      <div>
                        <div className="text-sm font-semibold mb-2">Parameters</div>
                        <ParamsTable
                          rows={ep.params.map((p) => ({
                            name: p.name,
                            where: p.where,
                            type: p.type,
                            required: p.required,
                            description: p.description,
                          }))}
                        />
                      </div>

                      {ep.auth?.required && (
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm">
                          <div className="font-semibold mb-1">Authentication required</div>
                          <div className="text-muted-foreground">{ep.auth.description}</div>
                        </div>
                      )}

                      {ep.rateLimit && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Rate limit:</span> {ep.rateLimit}
                        </div>
                      )}

                      {ep.notes?.length ? (
                        <div className="text-sm">
                          <div className="font-semibold mb-2">Notes</div>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {ep.notes.map((n, i) => (
                              <li key={i}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <div className="text-sm font-semibold mb-2">Example request</div>
                        <Card className="bg-black/40 border-white/10">
                          <CardContent className="p-4 overflow-x-auto">
                            <pre className="text-xs leading-relaxed font-mono">{ep.example.curl}</pre>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <div className="text-sm font-semibold mb-2">Example response</div>
                        <Card className="bg-black/40 border-white/10">
                          <CardContent className="p-4 overflow-x-auto">
                            <pre className="text-xs leading-relaxed font-mono">{ep.example.response}</pre>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <Separator className="my-10 opacity-10" />

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Conventions</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              <span className="text-foreground font-semibold">Rate limiting:</span> most write endpoints return
              <code className="mx-1">429</code> with a <code>Retry-After</code> header (seconds).
            </li>
            <li>
              <span className="text-foreground font-semibold">Caching:</span> some read endpoints send
              <code className="mx-1">Cache-Control</code>. Don&apos;t assume real-time.
            </li>
            <li>
              <span className="text-foreground font-semibold">JSON:</span> POST endpoints expect JSON and may return
              <code className="mx-1">400</code> if the body is invalid.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
