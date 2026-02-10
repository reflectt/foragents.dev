/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, Search, Timer, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RuntimeStatus = "healthy" | "warning" | "critical";

interface RuntimeSnapshot {
  id: string;
  agentHandle: string;
  uptime: number;
  requestCount: number;
  errorRate: number;
  avgLatency: number;
  status: RuntimeStatus;
  checkedAt: string;
}

const statusStyles: Record<RuntimeStatus, string> = {
  healthy: "border-green-500/40 text-green-400",
  warning: "border-yellow-500/40 text-yellow-400",
  critical: "border-red-500/40 text-red-400",
};

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default function RuntimeHealthPage() {
  const [snapshots, setSnapshots] = useState<RuntimeSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [agentHandle, setAgentHandle] = useState("all");
  const [status, setStatus] = useState("all");
  const [minErrorRate, setMinErrorRate] = useState("0");
  const [maxErrorRate, setMaxErrorRate] = useState("100");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadRuntime = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (agentHandle !== "all") params.set("agentHandle", agentHandle);
        if (status !== "all") params.set("status", status);
        params.set("minErrorRate", minErrorRate || "0");
        params.set("maxErrorRate", maxErrorRate || "100");

        const response = await fetch(`/api/diagnostics/runtime?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch runtime diagnostics");
        }

        const payload = (await response.json()) as { snapshots: RuntimeSnapshot[] };
        setSnapshots(payload.snapshots ?? []);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setFetchError("Unable to load runtime diagnostics.");
      } finally {
        setLoading(false);
      }
    };

    loadRuntime();

    return () => controller.abort();
  }, [search, agentHandle, status, minErrorRate, maxErrorRate]);

  useEffect(() => {
    if (!snapshots.length) {
      setSelectedId(null);
      return;
    }

    const stillExists = selectedId && snapshots.some((item) => item.id === selectedId);
    if (!stillExists) setSelectedId(snapshots[0].id);
  }, [snapshots, selectedId]);

  const selectedSnapshot = useMemo(
    () => snapshots.find((item) => item.id === selectedId) ?? null,
    [snapshots, selectedId]
  );

  const summary = useMemo(() => {
    if (!snapshots.length) {
      return {
        avgLatency: 0,
        avgErrorRate: 0,
        totalRequests: 0,
      };
    }

    const avgLatency = snapshots.reduce((sum, item) => sum + item.avgLatency, 0) / snapshots.length;
    const avgErrorRate = snapshots.reduce((sum, item) => sum + item.errorRate, 0) / snapshots.length;
    const totalRequests = snapshots.reduce((sum, item) => sum + item.requestCount, 0);

    return { avgLatency, avgErrorRate, totalRequests };
  }, [snapshots]);

  const agentHandles = useMemo(
    () => Array.from(new Set(snapshots.map((item) => item.agentHandle))).sort((a, b) => a.localeCompare(b)),
    [snapshots]
  );

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Runtime <span className="aurora-text">Health</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Live runtime snapshots with persistent records, filtering, and detailed health inspection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg latency</p>
                <p className="text-3xl font-bold mt-1">{summary.avgLatency.toFixed(0)}ms</p>
              </div>
              <Timer className="w-6 h-6 text-[#06D6A0]" />
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg error rate</p>
                <p className="text-3xl font-bold mt-1">{summary.avgErrorRate.toFixed(1)}%</p>
              </div>
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests tracked</p>
                <p className="text-3xl font-bold mt-1">{summary.totalRequests}</p>
              </div>
              <Zap className="w-6 h-6 text-purple-400" />
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
                placeholder="Search by snapshot id or agent handle"
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

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-4 grid grid-cols-2 gap-2">
              <Input
                value={minErrorRate}
                onChange={(event) => setMinErrorRate(event.target.value)}
                placeholder="Min error %"
                type="number"
                min={0}
                max={100}
              />
              <Input
                value={maxErrorRate}
                onChange={(event) => setMaxErrorRate(event.target.value)}
                placeholder="Max error %"
                type="number"
                min={0}
                max={100}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardHeader>
              <CardTitle>Runtime snapshots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {loading && <p className="text-sm text-muted-foreground">Loading runtime diagnostics...</p>}
              {fetchError && <p className="text-sm text-red-400">{fetchError}</p>}
              {!loading && !fetchError && snapshots.length === 0 && (
                <p className="text-sm text-muted-foreground">No snapshots match your current filters.</p>
              )}

              {snapshots.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedId === item.id
                      ? "border-[#06D6A0]/50 bg-[#06D6A0]/5"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{item.agentHandle}</p>
                    <Badge variant="outline" className={statusStyles[item.status]}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{item.requestCount} requests</span>
                    <span>{item.avgLatency}ms avg</span>
                    <span>{item.errorRate}% errors</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#0f0f0f] border-white/10">
            <CardHeader>
              <CardTitle>Snapshot detail</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSnapshot && (
                <p className="text-sm text-muted-foreground">Select a runtime snapshot to inspect details.</p>
              )}

              {selectedSnapshot && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Snapshot ID</p>
                    <p className="font-mono text-sm">{selectedSnapshot.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-xs text-muted-foreground">Uptime</p>
                      <p className="text-lg font-semibold">{formatUptime(selectedSnapshot.uptime)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-xs text-muted-foreground">Requests</p>
                      <p className="text-lg font-semibold">{selectedSnapshot.requestCount}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-xs text-muted-foreground">Avg latency</p>
                      <p className="text-lg font-semibold">{selectedSnapshot.avgLatency}ms</p>
                    </div>
                    <div className="rounded-lg border border-white/10 p-3">
                      <p className="text-xs text-muted-foreground">Error rate</p>
                      <p className="text-lg font-semibold">{selectedSnapshot.errorRate}%</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Health status</p>
                      <Badge variant="outline" className={statusStyles[selectedSnapshot.status]}>
                        {selectedSnapshot.status}
                      </Badge>
                    </div>
                    <div className="h-2 bg-white/5 rounded overflow-hidden">
                      <div
                        className={`h-full ${
                          selectedSnapshot.status === "healthy"
                            ? "bg-green-500"
                            : selectedSnapshot.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(selectedSnapshot.errorRate * 8, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Last checked at {new Date(selectedSnapshot.checkedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#0f0f0f] border-white/10 mt-6">
          <CardContent className="pt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <Activity className="w-4 h-4 mt-0.5 text-[#06D6A0]" />
            <p>
              Runtime snapshots are persisted in <code>data/diagnostic-runtime.json</code> and served via
              <code> /api/diagnostics/runtime</code>. You can add new snapshots by POSTing to that endpoint.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
