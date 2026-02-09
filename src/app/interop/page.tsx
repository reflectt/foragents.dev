/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { getInteropProtocols } from "@/lib/interop";

export const metadata: Metadata = {
  title: "Agent Interoperability Standards | forAgents.dev",
  description:
    "Explore the core protocols agents use to communicate and coordinate: MCP, A2A, OpenAPI, JSON-RPC, GraphQL, WebSocket, SSE, and webhooks.",
};

const maturityStyles: Record<string, string> = {
  stable: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  emerging: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  experimental: "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40",
};

const features = ["streaming", "bidirectional", "discovery", "auth", "typing"] as const;

export default function InteropHubPage() {
  const protocols = getInteropProtocols();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan">Interoperability</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Agent Interoperability Standards Hub</h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          Modern agents communicate across tool runtimes, APIs, event streams, and peer networks. This reference maps the
          interoperability landscape so you can pick protocols based on realtime needs, typing guarantees, discovery,
          and operational constraints.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/interop/decision-guide"
            className="px-4 py-2 rounded-md bg-cyan/20 border border-cyan/40 text-cyan hover:bg-cyan/30 transition"
          >
            Open decision guide
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Protocol cards</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {protocols.map((protocol) => (
            <article key={protocol.slug} className="rounded-xl border border-white/10 bg-card/40 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{protocol.name}</h3>
                  <p className="text-xs text-muted-foreground">{protocol.fullName}</p>
                </div>
                <span
                  className={`text-xs capitalize px-2 py-1 rounded border ${maturityStyles[protocol.maturity] ?? "bg-muted"}`}
                >
                  {protocol.maturity}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{protocol.description}</p>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Adoption level</span>
                  <span>{protocol.adoption}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan" style={{ width: `${protocol.adoption}%` }} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Best for</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {protocol.bestFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <Link href={`/interop/${protocol.slug}`} className="inline-block text-sm text-cyan hover:underline">
                View deep dive →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Comparison matrix</h2>
        <p className="text-sm text-muted-foreground">Protocols vs key features used in multi-agent systems.</p>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3 font-semibold">Protocol</th>
                {features.map((feature) => (
                  <th key={feature} className="text-left p-3 font-semibold capitalize">
                    {feature}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {protocols.map((protocol) => (
                <tr key={protocol.slug} className="border-t border-white/10">
                  <td className="p-3 font-medium">
                    <Link className="hover:underline" href={`/interop/${protocol.slug}`}>
                      {protocol.name}
                    </Link>
                  </td>
                  {features.map((feature) => (
                    <td key={feature} className="p-3 text-muted-foreground">
                      {protocol.features[feature] ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
