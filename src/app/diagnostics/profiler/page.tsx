/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Cpu, Search, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DiagnosticProfile {
  id: string;
  agentHandle: string;
  duration: number;
  tokenUsage: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  memoryPeak: number;
  createdAt: string;
}

export default function ProfilerPage() {
  const [profiles, setProfiles] = useState<DiagnosticProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [agentHandle, setAgentHandle] = useState("all");
  const [minDuration, setMinDuration] = useState("0");
  const [maxDuration, setMaxDuration] = useState("10000");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadProfiles = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (agentHandle !== "all") params.set("agentHandle", agentHandle);
        params.set("minDuration", minDuration || "0");
        params.set("maxDuration", maxDuration || "10000");

        const response = await fetch(`/api/diagnostics/profiler?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profiler data");
        }

        const payload = (await response.json()) as { profiles: DiagnosticProfile[] };
        setProfiles(payload.profiles ?? []);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setFetchError("Unable to load profiler snapshots.");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();

    return () => controller.abort();
  }, [search, agentHandle, minDuration, maxDuration]);

  useEffect(() => {
    if (!profiles.length) {
      setSelectedId(null);
      return;
    }

    const stillExists = selectedId && profiles.some((item) => item.id === selectedId);
    if (!stillExists) setSelectedId(profiles[0].id);
  }, [profiles, selectedId]);

  const selectedProfile = useMemo(
    () => profiles.find((item) => item.id === selectedId) ?? null,
    [profiles, selectedId]
  );

  const summary = useMemo(() => {
    if (!profiles.length) {
      return {
        avgDuration: 0,
        avgTokenUsage: 0,
        avgP95: 0,
      };
    }

    const avgDuration = profiles.reduce((sum, item) => sum + item.duration, 0) / profiles.length;
    const avgTokenUsage = profiles.reduce((sum, item) => sum + item.tokenUsage, 0) / profiles.length;
    const avgP95 = profiles.reduce((sum, item) => sum + item.latencyP95, 0) / profiles.length;

    return { avgDuration, avgTokenUsage, avgP95 };
  }, [profiles]);

  const agentHandles = useMemo(
    () => Array.from(new Set(profiles.map((item) => item.agentHandle))).sort((a, b) => a.localeCompare(b)),
    [profiles]
  );

  const maxDurationValue = useMemo(
    () => (profiles.length ? Math.max(...profiles.map((item) => item.duration)) : 1),
    [profiles]
  );

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Performance <span className="aurora-text">Profiler</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Persistent profiling snapshots with filters, search, and detailed latency breakdown.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg duration</p>
                <p className="text-3xl font-bold mt-1">{summary.avgDuration.toFixed(0)}ms</p>
              </div>
              <Clock className="w-6 h-6 text-[#06D6A0]" />
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg token usage</p>
                <p className="text-3xl font-bold mt-1">{summary.avgTokenUsage.toFixed(0)}</p>
              </div>
              <Zap className="w-6 h-6 text-yellow-400" />
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg p95 latency</p>
                <p className="text-3xl font-bold mt-1">{summary.avgP95.toFixed(0)}ms</p>
              </div>
              <Cpu className="w-6 h-6 text-purple-400" />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#0f0f0f] border-white/10 mb-6">
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Search by profile id or agent handle"
              />
            </div>
            <Select value={agentHandle} onValueChange={setAgentHandle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {agentHandles.map((handle) => (
                  <SelectItem key={handle} value={handle}>
                    {handle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                value={minDuration}
                onChange={(event) => setMinDuration(event.target.value)}
                placeholder="Min ms"
                type="number"
                min={0}
              />
              <Input
                value={maxDuration}
                onChange={(event) => setMaxDuration(event.target.value)}
                placeholder="Max ms"
                type="number"
                min={0}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardHeader>
              <CardTitle>Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {loading && <p className="text-sm text-muted-foreground">Loading profiler data...</p>}
              {fetchError && <p className="text-sm text-red-400">{fetchError}</p>}
              {!loading && !fetchError && profiles.length === 0 && (
                <p className="text-sm text-muted-foreground">No profiling snapshots match current filters.</p>
              )}

              {profiles.map((profile) => {
                const width = (profile.duration / maxDurationValue) * 100;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedId(profile.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedId === profile.id
                        ? "border-[#06D6A0]/50 bg-[#06D6A0]/5"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="font-medium text-sm">{profile.agentHandle}</p>
                      <Badge variant="outline" className="text-xs">
                        {profile.duration}ms
                      </Badge>
                    </div>
                    <div className="h-2 rounded bg-white/5 overflow-hidden">
                      <div className="h-full bg-[#06D6A0]/80" style={{ width: `${width}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(profile.createdAt).toLocaleString()}</p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-[#0f0f0f] border-white/10">
            <CardHeader>
              <CardTitle>Profile detail</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedProfile && (
                <p className="text-sm text-muted-foreground">Select a profile to inspect execution metrics.</p>
              )}

              {selectedProfile && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Profile ID</p>
                    <p className="font-mono text-sm">{selectedProfile.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-muted-foreground text-xs">Duration</p>
                      <p className="text-lg font-semibold">{selectedProfile.duration}ms</p>
                    </div>
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-muted-foreground text-xs">Token usage</p>
                      <p className="text-lg font-semibold">{selectedProfile.tokenUsage}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-muted-foreground text-xs">Memory peak</p>
                      <p className="text-lg font-semibold">{selectedProfile.memoryPeak}MB</p>
                    </div>
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-muted-foreground text-xs">Created at</p>
                      <p className="text-sm font-semibold">{new Date(selectedProfile.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 p-4">
                    <p className="text-xs text-muted-foreground mb-3">Latency distribution</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>p50</span>
                        <span className="font-mono">{selectedProfile.latencyP50}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>p95</span>
                        <span className="font-mono">{selectedProfile.latencyP95}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>p99</span>
                        <span className="font-mono">{selectedProfile.latencyP99}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
