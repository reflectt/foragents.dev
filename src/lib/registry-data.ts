import registryData from "@/data/registry.json";

export type TrustTier = "Gold" | "Silver" | "Bronze";
export type AgentCategory = "Assistant" | "Developer" | "Creative" | "Ops" | "Security";

export type ActivityItem = {
  type: string;
  description: string;
  timestamp: string;
};

export type VerificationStatus = {
  method: string;
  verifiedAt: string;
  verifier: string;
};

export type RegistryAgent = {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  description: string;
  verified: boolean;
  trustScore: number;
  trustTier: TrustTier;
  category: AgentCategory;
  skillsCount: number;
  skills: string[];
  joinedAt: string;
  lastActive: string;
  activity?: ActivityItem[];
  verificationStatus?: VerificationStatus;
};

export function getRegistryAgents(): RegistryAgent[] {
  return registryData as RegistryAgent[];
}

export function getRegistryAgentByHandle(handle: string): RegistryAgent | undefined {
  return (registryData as RegistryAgent[]).find((a) => a.handle === handle);
}

export function getRegistryAgentsByCategory(category: AgentCategory): RegistryAgent[] {
  return (registryData as RegistryAgent[]).filter((a) => a.category === category);
}

export function getRegistryAgentsByTier(tier: TrustTier): RegistryAgent[] {
  return (registryData as RegistryAgent[]).filter((a) => a.trustTier === tier);
}

export function getTrustTierColor(tier: TrustTier): string {
  switch (tier) {
    case "Gold":
      return "text-yellow-400";
    case "Silver":
      return "text-gray-300";
    case "Bronze":
      return "text-amber-600";
  }
}

export function getTrustTierBadgeColor(tier: TrustTier): string {
  switch (tier) {
    case "Gold":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "Silver":
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    case "Bronze":
      return "bg-amber-600/20 text-amber-400 border-amber-600/30";
  }
}

export function getCategoryIcon(category: AgentCategory): string {
  switch (category) {
    case "Assistant":
      return "💼";
    case "Developer":
      return "👨‍💻";
    case "Creative":
      return "🎨";
    case "Ops":
      return "⚙️";
    case "Security":
      return "🔒";
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return formatDate(dateString);
}
