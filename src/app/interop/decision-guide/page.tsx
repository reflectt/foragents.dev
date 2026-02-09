/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { getInteropProtocols } from "@/lib/interop";
import { DecisionGuideClient } from "./decision-guide-client";

export const metadata: Metadata = {
  title: "Protocol Decision Guide | forAgents.dev",
  description:
    "Answer a short questionnaire and get protocol recommendations for agent communication and coordination.",
};

export default function InteropDecisionGuidePage() {
  const protocols = getInteropProtocols();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <header className="space-y-4">
        <Link href="/interop" className="text-sm text-cyan hover:underline">
          ← Back to interoperability hub
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Protocol Decision Guide</h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          Use this guide to map your agent system needs to the right transport or interface protocol. The recommendation
          engine weighs realtime behavior, schema needs, discovery requirements, and ecosystem maturity.
        </p>
      </header>

      <DecisionGuideClient protocols={protocols} />
    </main>
  );
}
