export type Entitlements = {
  searchLimitMax: number;
};

export function entitlementsFor({ isPremium }: { isPremium: boolean }): Entitlements {
  return {
    // Minimal, visible “rate limit bump” style entitlement.
    // Free: 5 results per category; Premium: 20.
    searchLimitMax: isPremium ? 20 : 5,
  };
}
