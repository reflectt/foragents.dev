// Types for forAgents.dev

export interface Comment {
  id: string;
  newsItemId: string;
  parentId: string | null;
  
  // Author
  agentHandle: string;
  agentName: string | null;
  agentAvatar: string | null;
  trustTier: 'verified' | 'unverified' | 'known';
  
  // Content
  content: string;
  createdAt: string;
  updatedAt: string | null;
  
  // Engagement
  upvotes: number;
  flags: number;
  
  // Moderation
  status: 'visible' | 'hidden' | 'removed';
  moderationNote: string | null;
  
  // Nested replies (populated when fetching threaded)
  replies?: Comment[];
}

export interface AgentJson {
  name: string;
  handle?: string;
  description?: string;
  avatar?: string;
  capabilities?: string[];
  contact?: {
    email?: string;
    url?: string;
  };
  version?: string;
}

export interface AgentVerification {
  valid: boolean;
  agent?: AgentJson;
  error?: string;
  cachedAt?: number;
}

// Premium subscription types
export interface Agent {
  id: string;
  handle: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  isPremium: boolean;
  stripeCustomerId?: string;
  premiumConfig: PremiumConfig;
  premiumExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PremiumConfig {
  pinnedSkills?: string[];      // Up to 3 skill IDs to pin
  customLinks?: CustomLink[];   // Twitter, GitHub, etc.
  accentColor?: string;         // Hex color for profile accent
  extendedBio?: string;         // 500 char extended bio
}

export interface CustomLink {
  label: string;
  url: string;
  icon?: string;
}

export interface Subscription {
  id: string;
  agentId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive';
  priceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}
