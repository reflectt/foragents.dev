/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bug, Search, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ErrorSeverity = "low" | "medium" | "high" | "critical";
type ErrorStatus = "open" | "investigating" | "resolved";

interface DiagnosticError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  source: string;
  stackTrace: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  status: ErrorStatus;
}

const severityBadge: Record<ErrorSeverity, string> = {
  low: "border-blue-500/40 text-blue-400",
  medium: "border-yellow-500/40 text-yellow-400",
  high: "border-orange-500/40 text-orange-400",
  critical: "border-red-500/40 text-red-400",
};

const statusBadge: Record<ErrorStatus, string> = {
  open: "border-red-500/40 text-red-400",
  investigating: "border-yellow-500/40 text-yellow-400",
  resolved: "border-green-500/40 text-green-400",
};

export default function ErrorsPage() {
  const [errors, setErrors] = useState<DiagnosticError[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadErrors = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (severity !== "all") params.set("severity", severity);
        if (status !== "all") params.set("status", status);
        if (source !== "all") params.set("source", source);

        const response = await fetch(`/api/diagnostics/errors?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch diagnostic errors");
        }

        const payload = (await response.json()) as { errors: DiagnosticError[] };
        setErrors(payload.errors ?? []);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setFetchError("Unable to load diagnostics right now.");
      } finally {
        setLoading(false);
      }
    };

    loadErrors();

    return () => controller.abort();
  }, [search, severity, status, source]);

  useEffect(() => {
    if (!errors.length) {
      setSelectedId(null);
      return;
    }

    const stillExists = selectedId && errors.some((item) => item.id === selectedId);
    if (!stillExists) setSelectedId(errors[0].id);
  }, [errors, selectedId]);

  const selectedError = useMemo(
    () => errors.find((item) => item.id === selectedId) ?? null,
    [errors, selectedId]
  );

  const summary = useMemo(() => {
    const critical = errors.filter((item) => item.severity === "critical").length;
    const open = errors.filter((item) => item.status === "open").length;
    const totalCount = errors.reduce((sum, item) => sum + item.count, 0);

    return { critical, open, totalCount };
  }, [errors]);

  const sources = useMemo(
    () => Array.from(new Set(errors.map((item) => item.source))).sort((a, b) => a.localeCompare(b)),
    [errors]
  );

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Error <span className="aurora-text">Diagnostics</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Persistent error telemetry with search, filters, and deep stack trace inspection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total events</p>
                <p className="text-3xl font-bold mt-1">{summary.totalCount}</p>
              </div>
              <Bug className="w-6 h-6 text-[#06D6A0]" />
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open issues</p>
                <p className="text-3xl font-bold mt-1">{summary.open}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical patterns</p>
                <p className="text-3xl font-bold mt-1">{summary.critical}</p>
              </div>
              <ShieldAlert className="w-6 h-6 text-red-400" />
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
                placeholder="Search message, source, stack trace, or id"
              />
            </div>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardHeader>
              <CardTitle>Error stream</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {sources.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {loading && <p className="text-sm text-muted-foreground">Loading diagnostics...</p>}
              {fetchError && <p className="text-sm text-red-400">{fetchError}</p>}
              {!loading && !fetchError && errors.length === 0 && (
                <p className="text-sm text-muted-foreground">No errors match your current filters.</p>
              )}

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {errors.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedId === item.id
                        ? "border-[#06D6A0]/50 bg-[#06D6A0]/5"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{item.message}</p>
                      <span className="text-xs text-muted-foreground">x{item.count}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className={severityBadge[item.severity]}>
                        {item.severity}
                      </Badge>
                      <Badge variant="outline" className={statusBadge[item.status]}>
                        {item.status}
                      </Badge>
                      <code className="text-xs text-[#06D6A0]">{item.source}</code>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f0f0f] border-white/10">
            <CardHeader>
              <CardTitle>Error detail</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedError && <p className="text-sm text-muted-foreground">Select an error to inspect details.</p>}
              {selectedError && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="font-mono text-sm">{selectedError.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Message</p>
                    <p className="text-sm">{selectedError.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">First seen</p>
                      <p className="text-sm">{new Date(selectedError.firstSeen).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last seen</p>
                      <p className="text-sm">{new Date(selectedError.lastSeen).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Stack trace</p>
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words rounded border border-red-500/20 bg-black/40 p-3 text-red-300">
                      {selectedError.stackTrace}
                    </pre>
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
