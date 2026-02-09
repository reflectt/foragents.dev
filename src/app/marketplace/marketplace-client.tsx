"use client";

import { useState, useMemo } from "react";
import { type MarketplaceAgent, type Review } from "./page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MarketplaceClientProps {
  agents: MarketplaceAgent[];
}

type Category = "All" | "DevOps" | "Data" | "Security" | "Communication" | "Productivity";
type SortOption = "popular" | "rated" | "newest" | "price";

export function MarketplaceClient({ agents }: MarketplaceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category>("All");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  // Get featured agents (3 editor's picks)
  const featuredAgents = useMemo(() => {
    return agents.filter((a) => a.featured).slice(0, 3);
  }, [agents]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.category.toLowerCase().includes(query) ||
          agent.creator.toLowerCase().includes(query) ||
          agent.capabilities.some((cap) => cap.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter !== "All" && agent.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [agents, searchQuery, categoryFilter]);

  // Sort agents
  const sortedAgents = useMemo(() => {
    const sorted = [...filteredAgents];
    
    switch (sortBy) {
      case "popular":
        return sorted.sort((a, b) => b.deployments - a.deployments);
      case "rated":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "price":
        return sorted.sort((a, b) => {
          const priceOrder = { "Free": 0, "Premium": 1 };
          return priceOrder[a.pricing] - priceOrder[b.pricing];
        });
      default:
        return sorted;
    }
  }, [filteredAgents, sortBy]);

  const toggleReviews = (agentId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedReviews(newExpanded);
  };

  const categories: { value: Category; label: string; emoji: string }[] = [
    { value: "All", label: "All", emoji: "🎯" },
    { value: "DevOps", label: "DevOps", emoji: "⚙️" },
    { value: "Data", label: "Data", emoji: "📊" },
    { value: "Security", label: "Security", emoji: "🛡️" },
    { value: "Communication", label: "Communication", emoji: "💬" },
    { value: "Productivity", label: "Productivity", emoji: "🚀" },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Most Popular" },
    { value: "rated", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
    { value: "price", label: "Price" },
  ];

  return (
    <div>
      {/* Featured Skills Banner */}
      {featuredAgents.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4 flex items-center gap-2">
            ⭐ Editor&apos;s Picks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredAgents.map((agent) => (
              <FeaturedAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search agents by name, category, creator, or capabilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-2xl bg-black/40 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category)}>
          <TabsList className="bg-black/20 border border-white/10 flex-wrap h-auto">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="data-[state=active]:bg-cyan/20 data-[state=active]:text-cyan"
              >
                <span className="mr-1.5">{cat.emoji}</span>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Sort Options */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? "bg-purple/20 text-purple border border-purple/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Showing {sortedAgents.length} of {agents.length} agents
      </p>

      {/* Agent Grid */}
      {sortedAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              expanded={expandedReviews.has(agent.id)}
              onToggleReviews={() => toggleReviews(agent.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">No agents found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

function FeaturedAgentCard({ agent }: { agent: MarketplaceAgent }) {
  return (
    <Card className="bg-gradient-to-br from-cyan/10 to-purple/10 border-cyan/30 hover:border-cyan/50 transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-5xl">{agent.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-[#F8FAFC] text-lg">{agent.name}</h3>
              {agent.verified && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0">
                  ✓
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">by {agent.creator}</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
          {agent.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-amber-400">⭐</span>
            <span className="font-semibold text-white">{agent.rating.toFixed(1)}</span>
            <span>({agent.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📦</span>
            <span>{formatDeployments(agent.deployments)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentCard({
  agent,
  expanded,
  onToggleReviews,
}: {
  agent: MarketplaceAgent;
  expanded: boolean;
  onToggleReviews: () => void;
}) {
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      alert(`Installing ${agent.name}! This is a demo - actual installation would happen here.`);
      setDeploying(false);
    }, 1000);
  };

  const getPricingBadgeStyle = (pricing: string) => {
    switch (pricing) {
      case "Free":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Premium":
        return "bg-purple/20 text-purple border-purple/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  return (
    <Card className="bg-black/20 border-white/10 hover:border-cyan/30 transition-all flex flex-col group">
      <CardContent className="pt-6 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-4xl">{agent.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                {agent.name}
              </h3>
              {agent.verified && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0">
                  ✓
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0 border ${getPricingBadgeStyle(agent.pricing)}`}
              >
                {agent.pricing.toUpperCase()}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/5 text-white/60 border-white/10 text-[10px] px-2 py-0"
              >
                {agent.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">by {agent.creator}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/80 line-clamp-3 mb-3">
          {agent.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-amber-400">⭐</span>
            <span className="font-semibold text-white">{agent.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{agent.reviewCount} reviews</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📦</span>
            <span>{formatDeployments(agent.deployments)} installs</span>
          </div>
        </div>

        {/* Capabilities */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Capabilities:</p>
          <div className="flex flex-wrap gap-1.5">
            {agent.capabilities.slice(0, 3).map((cap) => (
              <Badge
                key={cap}
                variant="outline"
                className="bg-white/5 text-white/60 border-white/10 text-[10px] px-2 py-0"
              >
                {cap}
              </Badge>
            ))}
            {agent.capabilities.length > 3 && (
              <Badge
                variant="outline"
                className="bg-white/5 text-white/60 border-white/10 text-[10px] px-2 py-0"
              >
                +{agent.capabilities.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-4 flex-grow">
          <button
            onClick={onToggleReviews}
            className="text-xs text-cyan hover:text-cyan/80 transition-colors mb-2"
          >
            {expanded ? "Hide Reviews ▲" : `View Reviews (${agent.reviews.length}) ▼`}
          </button>
          
          {expanded && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {agent.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-auto">
          <Button
            onClick={handleDeploy}
            disabled={deploying}
            className="w-full bg-[#06D6A0] hover:bg-[#05c494] text-[#0a0a0a] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deploying ? "Installing..." : "Install Agent"}
          </Button>
          
          <WriteReviewDialog agentName={agent.name} />
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-white">{review.author}</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-xs ${
                  i < review.rating ? "text-amber-400" : "text-white/20"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(review.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <p className="text-xs text-foreground/80">{review.text}</p>
    </div>
  );
}

function WriteReviewDialog({ agentName }: { agentName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  const handleSubmit = () => {
    alert(
      `Review submitted for ${agentName}!\n\nRating: ${rating} stars\nReviewer: ${reviewerName}\nReview: ${reviewText}\n\nThis is a demo - actual review submission would happen here.`
    );
    setOpen(false);
    setRating(5);
    setReviewText("");
    setReviewerName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-white/20 text-white/80 hover:bg-white/10"
        >
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0a0a0a] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Write a Review for {agentName}</DialogTitle>
          <DialogDescription className="text-white/60">
            Share your experience with this agent to help others make informed decisions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-white/80">
              Your Name
            </Label>
            <Input
              id="name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Enter your name"
              className="bg-black/40 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          
          <div>
            <Label className="text-white/80 mb-2 block">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${
                    star <= rating ? "text-amber-400" : "text-white/20"
                  } hover:text-amber-400`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="review" className="text-white/80">
              Your Review
            </Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this agent..."
              className="bg-black/40 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-white/20 text-white/80 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reviewerName || !reviewText}
            className="bg-[#06D6A0] hover:bg-[#05c494] text-[#0a0a0a] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDeployments(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
