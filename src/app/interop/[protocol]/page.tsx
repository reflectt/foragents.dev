/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInteropProtocol, getInteropProtocols } from "@/lib/interop";

type ProtocolPageProps = {
  params: { protocol: string };
};

export async function generateStaticParams() {
  return getInteropProtocols().map((protocol) => ({ protocol: protocol.slug }));
}

export async function generateMetadata({ params }: ProtocolPageProps): Promise<Metadata> {
  const { protocol } = params;
  const selected = getInteropProtocol(protocol);

  if (!selected) {
    return {
      title: "Protocol not found | forAgents.dev",
    };
  }

  return {
    title: `${selected.name} Interoperability Guide | forAgents.dev`,
    description: selected.description,
  };
}

export default function ProtocolDeepDivePage({ params }: ProtocolPageProps) {
  const { protocol } = params;
  const selected = getInteropProtocol(protocol);

  if (!selected) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <header className="space-y-4">
        <Link href="/interop" className="text-sm text-cyan hover:underline">
          ← Back to interoperability hub
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{selected.name} Deep Dive</h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">{selected.description}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Architecture overview</h2>
        <p className="text-muted-foreground leading-relaxed">{selected.architectureOverview}</p>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <article className="space-y-3">
          <h2 className="text-xl font-semibold">Connection setup</h2>
          <pre className="rounded-xl border border-white/10 bg-black/30 p-4 overflow-x-auto text-xs leading-relaxed">
            <code>{selected.connectionExample}</code>
          </pre>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-semibold">Request / response example</h2>
          <pre className="rounded-xl border border-white/10 bg-black/30 p-4 overflow-x-auto text-xs leading-relaxed">
            <code>{selected.requestResponseExample}</code>
          </pre>
        </article>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <article className="rounded-xl border border-white/10 bg-card/40 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Pros</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {selected.pros.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-white/10 bg-card/40 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Cons</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {selected.cons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <article className="rounded-xl border border-white/10 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Compatible tools</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {selected.compatibleTools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-white/10 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Framework support</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {selected.frameworks.map((framework) => (
              <li key={framework}>{framework}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">When to use {selected.name}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {selected.whenToUse.map((entry) => (
            <article key={entry.scenario} className="rounded-xl border border-white/10 bg-card/30 p-4 space-y-2">
              <h3 className="font-semibold">{entry.scenario}</h3>
              <p className="text-sm text-muted-foreground">{entry.guidance}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
