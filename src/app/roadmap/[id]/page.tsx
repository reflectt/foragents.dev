/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RoadmapStatus = "planned" | "in-progress" | "completed" | "shipped";
type RoadmapCategory = "platform" | "tools" | "community" | "enterprise";

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  quarter: string;
  category: RoadmapCategory;
  votes: number;
  updatedAt: string;
};

const categoryColors: Record<RoadmapCategory, string> = {
  platform: "bg-cyan/10 text-cyan border-cyan/30",
  tools: "bg-purple/10 text-purple border-purple/30",
  community: "bg-green/10 text-green border-green/30",
  enterprise: "bg-blue/10 text-blue border-blue/30",
};

const statusColors: Record<RoadmapStatus, string> = {
  planned: "bg-slate-600/20 text-slate-300 border-slate-600/50",
  "in-progress": "bg-cyan/10 text-cyan border-cyan/30",
  completed: "bg-purple/10 text-purple border-purple/30",
  shipped: "bg-green/10 text-green border-green/30",
};

function toLabel(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoadmapItemPage({ params }: PageProps) {
  const { id } = use(params);
  const [item, setItem] = useState<RoadmapItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/roadmap/${id}`, { cache: "no-store" });
        const data = (await response.json()) as { item?: RoadmapItem; error?: string };

        if (!response.ok || !data.item) {
          throw new Error(data.error ?? "Roadmap item not found");
        }

        setItem(data.item);
      } catch (loadError) {
        console.error(loadError);
        setError(loadError instanceof Error ? loadError.message : "Failed to load roadmap item.");
      } finally {
        setLoading(false);
      }
    }

    void loadItem();
  }, [id]);

  const handleVote = async () => {
    if (!item || voting) {
      return;
    }

    setVoting(true);
    setError(null);

    try {
      const response = await fetch(`/api/roadmap/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await response.json()) as { item?: RoadmapItem; error?: string };

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Failed to vote");
      }

      setItem(data.item);
    } catch (voteError) {
      console.error(voteError);
      setError(voteError instanceof Error ? voteError.message : "Failed to vote for this feature.");
    } finally {
      setVoting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0E17]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan transition-colors mb-6"
        >
          ← Back to Roadmap
        </Link>

        {loading ? (
          <p className="text-slate-400">Loading roadmap item...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : !item ? (
          <p className="text-slate-400">Roadmap item not found.</p>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="outline" className={`${categoryColors[item.category]} text-sm`}>
                  {toLabel(item.category)}
                </Badge>
                <Badge variant="outline" className={`${statusColors[item.status]} text-sm`}>
                  {toLabel(item.status)}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{item.title}</h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                <span>
                  <span className="font-medium text-white">{item.votes}</span> votes
                </span>
                <span>{item.quarter}</span>
                <span>Updated {formatDate(item.updatedAt)}</span>
              </div>
            </div>

            <div className="mb-8">
              <Button
                onClick={handleVote}
                disabled={voting}
                size="lg"
                className="bg-cyan text-[#0a0a0a] hover:bg-cyan/90 disabled:bg-slate-700 disabled:text-slate-400"
              >
                {voting ? "Voting..." : "Vote for this feature"}
              </Button>
            </div>

            <Card className="bg-slate-900/40 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                <p className="text-slate-300 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
