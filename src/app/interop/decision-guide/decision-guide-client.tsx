"use client";

/* eslint-disable react/no-unescaped-entities */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { InteropProtocol } from "@/lib/interop";

type Question = {
  id: string;
  prompt: string;
  options: Array<{
    label: string;
    scores: Record<string, number>;
  }>;
};

type AnswerMap = Record<string, number>;

const questions: Question[] = [
  {
    id: "realtime",
    prompt: "How realtime does your agent communication need to be?",
    options: [
      {
        label: "Batch or event-based is fine",
        scores: { webhooks: 4, openapi: 2, "json-rpc": 1 },
      },
      {
        label: "Occasional streaming updates",
        scores: { sse: 4, graphql: 2, mcp: 2 },
      },
      {
        label: "Continuous low-latency bidirectional",
        scores: { websocket: 5, a2a: 4, mcp: 2 },
      },
    ],
  },
  {
    id: "typing",
    prompt: "How important are typed contracts and schemas?",
    options: [
      {
        label: "Critical for reliability and governance",
        scores: { openapi: 5, graphql: 4, mcp: 4 },
      },
      {
        label: "Nice to have",
        scores: { "json-rpc": 2, websocket: 2, sse: 1 },
      },
      {
        label: "Not important right now",
        scores: { webhooks: 2, a2a: 2 },
      },
    ],
  },
  {
    id: "discovery",
    prompt: "Do you need dynamic capability discovery?",
    options: [
      {
        label: "Yes, agents should inspect available capabilities",
        scores: { mcp: 5, graphql: 4, a2a: 3, openapi: 2 },
      },
      {
        label: "No, static contracts are enough",
        scores: { openapi: 3, webhooks: 2, sse: 1 },
      },
    ],
  },
  {
    id: "integration",
    prompt: "What's your primary integration style?",
    options: [
      {
        label: "Connect agents to existing HTTP APIs",
        scores: { openapi: 5, graphql: 4, webhooks: 2 },
      },
      {
        label: "Coordinate multiple autonomous agents",
        scores: { a2a: 5, mcp: 3, websocket: 3 },
      },
      {
        label: "Expose runtime tools/capabilities to LLM hosts",
        scores: { mcp: 6, "json-rpc": 2, openapi: 2 },
      },
    ],
  },
  {
    id: "ops",
    prompt: "Which operational posture fits your team best?",
    options: [
      {
        label: "Mature standards and broad ecosystem",
        scores: { openapi: 4, webhooks: 4, graphql: 3 },
      },
      {
        label: "Move fast with modern agent-native standards",
        scores: { mcp: 5, a2a: 4, websocket: 2 },
      },
      {
        label: "Keep implementation minimal",
        scores: { sse: 4, "json-rpc": 3, webhooks: 2 },
      },
    ],
  },
];

function rankProtocols(protocols: InteropProtocol[], answers: AnswerMap) {
  const baseScores: Record<string, number> = Object.fromEntries(protocols.map((protocol) => [protocol.slug, 0]));

  for (const question of questions) {
    const selectedOption = question.options[answers[question.id]];
    if (!selectedOption) {
      continue;
    }

    for (const [slug, score] of Object.entries(selectedOption.scores)) {
      baseScores[slug] = (baseScores[slug] ?? 0) + score;
    }
  }

  return protocols
    .map((protocol) => ({ protocol, score: baseScores[protocol.slug] ?? 0 }))
    .sort((a, b) => b.score - a.score || b.protocol.adoption - a.protocol.adoption);
}

export function DecisionGuideClient({ protocols }: { protocols: InteropProtocol[] }) {
  const [answers, setAnswers] = useState<AnswerMap>({});

  const ranked = useMemo(() => rankProtocols(protocols, answers), [protocols, answers]);
  const topTwo = ranked.slice(0, 2);

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Interactive questionnaire</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Answer these questions to get a protocol recommendation tailored to your coordination, latency, and integration
          requirements.
        </p>
        <div className="space-y-6">
          {questions.map((question) => (
            <article key={question.id} className="rounded-xl border border-white/10 bg-card/30 p-4 space-y-3">
              <h3 className="font-medium">{question.prompt}</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {question.options.map((option, index) => {
                  const isSelected = answers[question.id] === index;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
                      className={`text-left rounded-lg border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-cyan/70 bg-cyan/15 text-foreground"
                          : "border-white/10 bg-background/40 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Top recommendations</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {topTwo.map(({ protocol, score }, index) => (
            <article key={protocol.slug} className="rounded-xl border border-white/10 bg-card/40 p-5 space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">#{index + 1} Recommendation</p>
              <h3 className="text-xl font-semibold">{protocol.name}</h3>
              <p className="text-sm text-muted-foreground">{protocol.description}</p>
              <p className="text-sm">
                <span className="text-muted-foreground">Match score:</span> {score}
              </p>
              <Link href={`/interop/${protocol.slug}`} className="text-sm text-cyan hover:underline">
                View protocol deep dive →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Decision tree (CSS only)</h2>
        <div className="rounded-xl border border-white/10 bg-card/30 p-5 text-sm">
          <div className="pl-3 border-l border-cyan/60 space-y-4">
            <div>
              <p className="font-semibold">Need bidirectional realtime collaboration?</p>
              <div className="mt-2 pl-4 border-l border-white/20 space-y-2">
                <p>
                  <span className="text-cyan">Yes</span> → WebSocket (low latency) or A2A (delegation-first)
                </p>
                <p>
                  <span className="text-cyan">No</span> → continue
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Need typed schema and enterprise governance?</p>
              <div className="mt-2 pl-4 border-l border-white/20 space-y-2">
                <p>
                  <span className="text-cyan">Yes</span> → OpenAPI (REST) or GraphQL (query flexibility)
                </p>
                <p>
                  <span className="text-cyan">No</span> → continue
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Need one-way stream to UI?</p>
              <div className="mt-2 pl-4 border-l border-white/20 space-y-2">
                <p>
                  <span className="text-cyan">Yes</span> → SSE
                </p>
                <p>
                  <span className="text-cyan">No</span> → Webhooks (events) or JSON-RPC (compact RPC)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {topTwo.length === 2 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Side-by-side comparison</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {topTwo.map(({ protocol }) => (
              <article key={protocol.slug} className="rounded-xl border border-white/10 p-5 space-y-3">
                <h3 className="text-xl font-semibold">{protocol.name}</h3>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Adoption: {protocol.adoption}%</li>
                  <li>Streaming: {protocol.features.streaming ? "Yes" : "No"}</li>
                  <li>Bidirectional: {protocol.features.bidirectional ? "Yes" : "No"}</li>
                  <li>Discovery: {protocol.features.discovery ? "Yes" : "No"}</li>
                  <li>Typing: {protocol.features.typing ? "Yes" : "No"}</li>
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
