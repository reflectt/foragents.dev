"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import metricsData from "@/data/metrics.json";

interface CurrentMetrics {
  requestsPerMinute: number;
  avgLatencyMs: number;
  errorRate: number;
  activeAgents: number;
}

interface TopEndpoint {
  endpoint: string;
  avgResponseTime: number;
  requestCount: number;
  statusCode: number;
  lastHour: number;
}

interface RecentError {
  timestamp: string;
  endpoint: string;
  statusCode: number;
  message: string;
  count: number;
}

interface UptimeHistory {
  date: string;
  uptime: number;
}

interface MetricsData {
  currentMetrics: CurrentMetrics;
  topEndpoints: TopEndpoint[];
  recentErrors: RecentError[];
  uptimeHistory: UptimeHistory[];
}

const data = metricsData as MetricsData;

export default function MetricsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setLastUpdate(new Date());
      setTimeout(() => setIsRefreshing(false), 500);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "text-[#06D6A0]";
    if (statusCode >= 400 && statusCode < 500) return "text-yellow-500";
    if (statusCode >= 500) return "text-red-500";
    return "text-foreground";
  };

  const getStatusBadgeColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300)
      return "bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30";
    if (statusCode >= 400 && statusCode < 500)
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    if (statusCode >= 500) return "bg-red-500/20 text-red-500 border-red-500/30";
    return "bg-foreground/20 text-foreground border-foreground/30";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-2">
                API Metrics
              </h1>
              <p className="text-xl text-foreground/80">
                Real-time performance monitoring for forAgents.dev
              </p>
            </div>

            {/* Auto-refresh indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  isRefreshing
                    ? "border-[#06D6A0] bg-[#06D6A0]/10"
                    : "border-white/10 bg-card/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isRefreshing ? "bg-[#06D6A0] animate-pulse" : "bg-[#06D6A0]"
                  }`}
                />
                <span className="text-sm text-foreground/80">
                  {isRefreshing ? "Updating..." : `Updated ${formatTime(lastUpdate)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Key Metrics Cards */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Requests per minute */}
          <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-card/30 border-[#06D6A0]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Requests / Minute
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#06D6A0] mb-1">
                {data.currentMetrics.requestsPerMinute.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ↑ 12% from last hour
              </p>
            </CardContent>
          </Card>

          {/* Average latency */}
          <Card className="bg-gradient-to-br from-[#3B82F6]/10 to-card/30 border-[#3B82F6]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#3B82F6] mb-1">
                {data.currentMetrics.avgLatencyMs}
                <span className="text-2xl">ms</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ↓ 8% from last hour
              </p>
            </CardContent>
          </Card>

          {/* Error rate */}
          <Card className="bg-gradient-to-br from-[#8B5CF6]/10 to-card/30 border-[#8B5CF6]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#8B5CF6] mb-1">
                {data.currentMetrics.errorRate}
                <span className="text-2xl">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ↑ 0.1% from last hour
              </p>
            </CardContent>
          </Card>

          {/* Active agents */}
          <Card className="bg-gradient-to-br from-[#F59E0B]/10 to-card/30 border-[#F59E0B]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#F59E0B] mb-1">
                {data.currentMetrics.activeAgents.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ↑ 23 new in last hour
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Top Endpoints Table */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Top Endpoints</CardTitle>
            <p className="text-sm text-muted-foreground">
              Most requested API endpoints with performance metrics
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Endpoint
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Avg Response Time
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Total Requests
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Last Hour
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topEndpoints.map((endpoint, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <code className="text-sm font-mono text-foreground">
                          {endpoint.endpoint}
                        </code>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`text-sm font-semibold ${
                            endpoint.avgResponseTime < 100
                              ? "text-[#06D6A0]"
                              : endpoint.avgResponseTime < 200
                                ? "text-[#3B82F6]"
                                : "text-yellow-500"
                          }`}
                        >
                          {endpoint.avgResponseTime}ms
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-foreground/80">
                        {endpoint.requestCount.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-foreground/80">
                        {endpoint.lastHour.toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeColor(endpoint.statusCode)}
                        >
                          {endpoint.statusCode}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Error Log Feed */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Errors</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last 20 errors with timestamps and details
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentErrors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-card/20 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Status code badge */}
                  <Badge
                    variant="outline"
                    className={`${getStatusBadgeColor(error.statusCode)} shrink-0 font-mono`}
                  >
                    {error.statusCode}
                  </Badge>

                  {/* Error details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <code className="text-sm font-mono text-foreground">
                        {error.endpoint}
                      </code>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimestamp(error.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                    {error.count > 1 && (
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-500 border-red-500/30 text-xs"
                        >
                          {error.count} occurrences
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Uptime History */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Uptime History</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last 7 days uptime percentage
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.uptimeHistory.map((day, index) => {
                const uptimePercent = day.uptime;
                const isToday = index === data.uptimeHistory.length - 1;
                const color =
                  uptimePercent >= 99.9
                    ? "#06D6A0"
                    : uptimePercent >= 99.5
                      ? "#3B82F6"
                      : uptimePercent >= 99.0
                        ? "#F59E0B"
                        : "#EF4444";

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {isToday && (
                          <Badge
                            variant="outline"
                            className="bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30 text-xs"
                          >
                            Today
                          </Badge>
                        )}
                      </div>
                      <span className="font-bold" style={{ color }}>
                        {uptimePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="relative w-full h-3 bg-card/20 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all"
                        style={{
                          width: `${uptimePercent}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Average uptime */}
            <Separator className="opacity-10 my-6" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">7-day average</span>
              <span className="text-2xl font-bold text-[#06D6A0]">
                {(
                  data.uptimeHistory.reduce((acc, day) => acc + day.uptime, 0) /
                  data.uptimeHistory.length
                ).toFixed(2)}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need more detailed metrics?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Premium members get access to historical data, custom dashboards, alerts, and
              advanced analytics for all API endpoints.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Upgrade to Premium →
              </a>
              <a
                href="/api-docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                View API Docs
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
