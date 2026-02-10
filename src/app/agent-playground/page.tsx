/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Beaker, Clock3, History, Play, Sigma, TrendingUp } from "lucide-react";

type PlaygroundRunStatus = "success" | "error";

type PlaygroundRun = {
  id: string;
  agentHandle: string;
  prompt: string;
  response: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  status: PlaygroundRunStatus;
  createdAt: string;
};

type RunsResponse = {
  runs: PlaygroundRun[];
};

const AGENT_OPTIONS = [
  "all",
  "@kai@reflectt.ai",
  "@patcher@foragents.dev",
  "@inspector@foragents.dev",
  "@synth@reflectt.ai",
  "@ops@foragents.dev",
];

const MODEL_OPTIONS = [
  "claude-3.5-sonnet",
  "claude-3-haiku",
  "gpt-4o",
  "gpt-4o-mini",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

export default function AgentPlaygroundPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("claude-3.5-sonnet");
  const [prompt, setPrompt] = useState<string>("");
  const [runs, setRuns] = useState<PlaygroundRun[]>([]);
  const [currentRun, setCurrentRun] = useState<PlaygroundRun | null>(null);
  const [loadingRuns, setLoadingRuns] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchRuns = useCallback(async () => {
    setLoadingRuns(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (selectedAgent !== "all") params.set("agent", selectedAgent);

      const response = await fetch(`/api/agent-playground?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load runs (${response.status})`);
      }

      const payload = (await response.json()) as RunsResponse;
      setRuns(payload.runs ?? []);
      setCurrentRun((previous) => previous ?? payload.runs?.[0] ?? null);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load runs";
      setError(message);
    } finally {
      setLoadingRuns(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    void fetchRuns();
  }, [fetchRuns]);

  const runTest = async () => {
    if (!prompt.trim()) return;

    setRunning(true);
    setError("");

    const runAgent = selectedAgent === "all" ? "@kai@reflectt.ai" : selectedAgent;

    try {
      const response = await fetch("/api/agent-playground", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentHandle: runAgent,
          prompt,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Run failed (${response.status})`);
      }

      const payload = (await response.json()) as { run: PlaygroundRun };
      setCurrentRun(payload.run);
      setPrompt("");
      await fetchRuns();
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "Run failed";
      setError(message);
    } finally {
      setRunning(false);
    }
  };

  const stats = useMemo(() => {
    if (runs.length === 0) {
      return {
        total: 0,
        avgLatencyMs: 0,
        avgTokens: 0,
        successRate: 0,
      };
    }

    const totals = runs.reduce(
      (acc, run) => {
        acc.latency += run.latencyMs;
        acc.tokens += run.tokensUsed;
        acc.success += run.status === "success" ? 1 : 0;
        return acc;
      },
      { latency: 0, tokens: 0, success: 0 }
    );

    return {
      total: runs.length,
      avgLatencyMs: Math.round(totals.latency / runs.length),
      avgTokens: Math.round(totals.tokens / runs.length),
      successRate: Math.round((totals.success / runs.length) * 100),
    };
  }, [runs]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden py-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4">
          <Badge variant="outline" className="mb-3 border-purple-500/30 bg-purple-500/10 text-xs text-purple-400">
            <Beaker className="mr-1 inline h-3 w-3" />
            Persistent Run Data
          </Badge>
          <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">Agent Playground</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Run prompts against simulated agents, store every run, and review each agent's latency/token trends over time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="border-white/10 bg-card/50">
            <CardContent className="flex items-center gap-3 p-4">
              <History className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-xs text-muted-foreground">Total Runs</p>
                <p className="text-xl font-semibold text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-card/50">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock3 className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Latency</p>
                <p className="text-xl font-semibold text-white">{stats.avgLatencyMs} ms</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-card/50">
            <CardContent className="flex items-center gap-3 p-4">
              <Sigma className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Tokens</p>
                <p className="text-xl font-semibold text-white">{stats.avgTokens}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-card/50">
            <CardContent className="flex items-center gap-3 p-4">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-xl font-semibold text-white">{stats.successRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-white">Run a Test</CardTitle>
              <CardDescription>Choose agent + model, submit a prompt, and store the result.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white" htmlFor="agent-select">Agent</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger id="agent-select" className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#1a1a1a]">
                    {AGENT_OPTIONS.map((agent) => (
                      <SelectItem key={agent} value={agent} className="text-white focus:bg-white/10 focus:text-white">
                        {agent === "all" ? "All agents (filter off)" : agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white" htmlFor="model-select">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model-select" className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#1a1a1a]">
                    {MODEL_OPTIONS.map((model) => (
                      <SelectItem key={model} value={model} className="text-white focus:bg-white/10 focus:text-white">
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white" htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask the agent to summarize, analyze, or debug..."
                  className="min-h-[140px] resize-y border-white/10 bg-white/5 text-white"
                />
              </div>

              <Button
                onClick={runTest}
                disabled={running || !prompt.trim()}
                className="w-full bg-purple-500 text-white hover:bg-purple-600"
              >
                <Play className="mr-2 h-4 w-4" />
                {running ? "Running..." : "Run Prompt"}
              </Button>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50">
            <CardHeader>
              <CardTitle className="text-white">Latest Response</CardTitle>
              <CardDescription>
                {currentRun
                  ? `${currentRun.agentHandle} • ${currentRun.model} • ${currentRun.status}`
                  : "Run a prompt to generate a response"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentRun ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={currentRun.status === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                      {currentRun.status}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-muted-foreground">
                      {currentRun.latencyMs} ms
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-muted-foreground">
                      {currentRun.tokensUsed} tokens
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4">
                    <p className="mb-2 text-xs text-muted-foreground">Prompt</p>
                    <p className="mb-4 whitespace-pre-wrap text-sm text-white">{currentRun.prompt}</p>
                    <p className="mb-2 text-xs text-muted-foreground">Response</p>
                    <pre className="whitespace-pre-wrap text-sm text-white">{currentRun.response}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[220px] items-center justify-center text-muted-foreground">
                  No response yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-white/10 bg-card/50">
          <CardHeader>
            <CardTitle className="text-white">Past Runs</CardTitle>
            <CardDescription>Persisted run history from data/playground-runs.json</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRuns ? (
              <p className="text-sm text-muted-foreground">Loading runs...</p>
            ) : runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs found for this filter.</p>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => (
                  <button
                    key={run.id}
                    onClick={() => setCurrentRun(run)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge className="bg-purple-500/20 text-purple-400">{run.agentHandle}</Badge>
                      <Badge variant="outline" className="border-white/20 text-muted-foreground">{run.model}</Badge>
                      <Badge className={run.status === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                        {run.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(run.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="truncate text-sm text-white">{run.prompt}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />
    </div>
  );
}
