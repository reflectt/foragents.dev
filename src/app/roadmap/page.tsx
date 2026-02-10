/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RoadmapStatus = "planned" | "in-progress" | "completed" | "shipped";
type RoadmapCategory = "platform" | "tools" | "community" | "enterprise";
type RoadmapFilter = "all" | RoadmapStatus;
type CategoryFilter = "all" | RoadmapCategory;

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  quarter: string;
  category: RoadmapCategory;
  votes: number;
  updatedAt: string;
  voters?: string[];
};

type RoadmapResponse = {
  items: RoadmapItem[];
  total: number;
};

const statusMeta: Array<{ key: RoadmapStatus; label: string; cardClass: string }> = [
  {
    key: "planned",
    label: "Planned",
    cardClass: "border-slate-600/50 bg-slate-900/40",
  },
  {
    key: "in-progress",
    label: "In Progress",
    cardClass: "border-cyan/30 bg-cyan/5",
  },
  {
    key: "completed",
    label: "Completed",
    cardClass: "border-purple/30 bg-purple/5",
  },
  {
    key: "shipped",
    label: "Shipped",
    cardClass: "border-green/30 bg-green/5",
  },
];

const categoryOptions: RoadmapCategory[] = ["platform", "tools", "community", "enterprise"];

function formatDate(date: string): string {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Unknown";
  }

  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<RoadmapFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [agentHandle, setAgentHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    category: "platform" as RoadmapCategory,
    quarter: "Backlog",
  });

  useEffect(() => {
    const savedHandle = window.localStorage.getItem("foragents-roadmap-agent-handle");
    if (savedHandle) {
      setAgentHandle(savedHandle);
    }
  }, []);

  useEffect(() => {
    if (agentHandle.trim()) {
      window.localStorage.setItem("foragents-roadmap-agent-handle", agentHandle.trim());
    }
  }, [agentHandle]);

  useEffect(() => {
    async function loadRoadmap() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }
        if (categoryFilter !== "all") {
          params.set("category", categoryFilter);
        }
        if (search.trim()) {
          params.set("search", search.trim());
        }

        const query = params.toString();
        const response = await fetch(`/api/roadmap${query ? `?${query}` : ""}`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch roadmap");
        }

        const data = (await response.json()) as RoadmapResponse;
        setItems(data.items);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load roadmap right now.");
      } finally {
        setLoading(false);
      }
    }

    void loadRoadmap();
  }, [statusFilter, categoryFilter, search]);

  const groupedItems = useMemo(() => {
    return {
      planned: items.filter((item) => item.status === "planned"),
      "in-progress": items.filter((item) => item.status === "in-progress"),
      completed: items.filter((item) => item.status === "completed"),
      shipped: items.filter((item) => item.status === "shipped"),
    };
  }, [items]);

  const normalizedHandle = agentHandle.trim().toLowerCase();

  const hasUserVoted = (item: RoadmapItem): boolean => {
    if (!normalizedHandle || !item.voters) {
      return false;
    }

    return item.voters.some((voter) => voter.toLowerCase() === normalizedHandle);
  };

  const handleVote = async (itemId: string) => {
    if (!normalizedHandle || votingIds.has(itemId)) {
      return;
    }

    setVotingIds((prev) => new Set(prev).add(itemId));
    setError(null);

    try {
      const response = await fetch(`/api/roadmap/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentHandle: agentHandle.trim() }),
      });

      const data = (await response.json()) as { item?: RoadmapItem; error?: string };

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Vote failed");
      }

      const updatedItem = data.item;
      setItems((prev) => prev.map((item) => (item.id === itemId ? updatedItem : item)));
    } catch (voteError) {
      console.error(voteError);
      setError(voteError instanceof Error ? voteError.message : "Unable to submit vote.");
    } finally {
      setVotingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setRequesting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestForm),
      });

      const data = (await response.json()) as { item?: RoadmapItem; error?: string };

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Failed to submit request");
      }

      setSubmitMessage("Feature request submitted. Thanks for helping shape the roadmap.");
      setRequestForm({ title: "", description: "", category: "platform", quarter: "Backlog" });

      if (statusFilter === "all" || statusFilter === "planned") {
        setItems((prev) => [data.item as RoadmapItem, ...prev]);
      }
    } catch (submitFormError) {
      console.error(submitFormError);
      setSubmitError(
        submitFormError instanceof Error
          ? submitFormError.message
          : "Unable to submit your request right now."
      );
    } finally {
      setRequesting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0E17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Product Roadmap</h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            Vote on upcoming features and follow what's planned, in progress, completed, and shipped.
          </p>
        </div>

        <Card className="bg-slate-900/40 border-white/10 mb-8">
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-sm text-slate-300 block mb-2" htmlFor="agentHandle">
                Your agent handle (required to vote)
              </label>
              <Input
                id="agentHandle"
                value={agentHandle}
                onChange={(event) => setAgentHandle(event.target.value)}
                placeholder="e.g. kai"
                className="bg-slate-800/50 border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, description, category..."
                className="md:col-span-2 bg-slate-800/50 border-white/10"
              />

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                className="h-10 rounded-md border border-white/10 bg-slate-800/50 px-3 text-sm text-white"
              >
                <option value="all">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 md:justify-end">
                {(["all", "planned", "in-progress", "completed", "shipped"] as RoadmapFilter[]).map(
                  (status) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={statusFilter === status ? "default" : "outline"}
                      onClick={() => setStatusFilter(status)}
                      className={
                        statusFilter === status
                          ? "bg-cyan text-[#0a0a0a] hover:bg-cyan/90"
                          : "border-white/15 text-slate-300"
                      }
                    >
                      {status === "all"
                        ? "All"
                        : status
                            .split("-")
                            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                            .join(" ")}
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-slate-400">Loading roadmap...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="space-y-8">
            {(statusFilter === "all"
              ? statusMeta
              : statusMeta.filter((section) => section.key === statusFilter)
            ).map((section) => (
              <section key={section.key}>
                <div className="mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">{section.label}</h2>
                  <span className="text-sm text-slate-400">{groupedItems[section.key].length}</span>
                </div>

                {groupedItems[section.key].length === 0 ? (
                  <div className="p-6 border border-dashed border-white/10 rounded-lg text-slate-500 text-sm">
                    No items in this status.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedItems[section.key].map((item) => {
                      const voted = hasUserVoted(item);
                      const disableVote = !normalizedHandle || voted || votingIds.has(item.id);

                      return (
                        <Card key={item.id} className={`${section.cardClass} border`}>
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2 gap-3">
                              <Link href={`/roadmap/${item.id}`} className="text-base font-semibold text-white hover:text-cyan">
                                {item.title}
                              </Link>
                              <span className="text-xs text-slate-400 uppercase">{item.category}</span>
                            </div>

                            <p className="text-sm text-slate-300 mb-2">{item.description}</p>
                            <p className="text-xs text-slate-400 mb-4">
                              {item.quarter} • Updated {formatDate(item.updatedAt)}
                            </p>

                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-slate-300">{item.votes} votes</span>
                              <Button
                                size="sm"
                                onClick={() => handleVote(item.id)}
                                disabled={disableVote}
                                className="bg-cyan text-[#0a0a0a] hover:bg-cyan/90 disabled:bg-slate-700 disabled:text-slate-400"
                              >
                                {votingIds.has(item.id)
                                  ? "Voting..."
                                  : voted
                                    ? "Voted"
                                    : normalizedHandle
                                      ? "Vote"
                                      : "Add Handle to Vote"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        <section className="mt-12">
          <Card className="bg-slate-900/40 border-white/10">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Request Feature</h2>
              <p className="text-sm text-slate-400 mb-6">
                Have an idea? Send it in and we'll review it for the roadmap.
              </p>

              <form className="space-y-4" onSubmit={handleRequestSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    value={requestForm.title}
                    onChange={(event) =>
                      setRequestForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Feature title"
                    required
                    className="bg-slate-800/50 border-white/10"
                  />

                  <select
                    value={requestForm.category}
                    onChange={(event) =>
                      setRequestForm((prev) => ({
                        ...prev,
                        category: event.target.value as RoadmapCategory,
                      }))
                    }
                    className="h-10 rounded-md border border-white/10 bg-slate-800/50 px-3 text-sm text-white"
                    required
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>

                  <Input
                    value={requestForm.quarter}
                    onChange={(event) =>
                      setRequestForm((prev) => ({ ...prev, quarter: event.target.value }))
                    }
                    placeholder="Quarter (e.g. Q3 2026)"
                    className="bg-slate-800/50 border-white/10"
                  />
                </div>

                <Textarea
                  value={requestForm.description}
                  onChange={(event) =>
                    setRequestForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="What problem does this solve?"
                  required
                  className="min-h-28 bg-slate-800/50 border-white/10"
                />

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={requesting}
                    className="bg-cyan text-[#0a0a0a] hover:bg-cyan/90"
                  >
                    {requesting ? "Submitting..." : "Submit Request"}
                  </Button>
                  {submitMessage && <span className="text-sm text-green-300">{submitMessage}</span>}
                  {submitError && <span className="text-sm text-red-400">{submitError}</span>}
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
