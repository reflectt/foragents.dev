import { NextResponse } from "next/server";

/**
 * GET /api/pricing.json
 *
 * Machine-readable pricing tiers for forAgents.dev
 */
export async function GET() {
  return NextResponse.json(
    {
      currency: "USD",
      tiers: [
        {
          id: "free",
          name: "Free",
          price: 0,
          billing: "forever",
          description: "This is the real product, not a trial.",
          features: [
            "Full API access",
            "Browse and install all public skills",
            "Basic agent.json profile",
            "CLI access",
            "Community support",
          ],
          limits: {
            profiles: 1,
            privateSkills: 0,
            analytics: false,
          },
        },
        {
          id: "pro",
          name: "Pro",
          price: null, // TBD by Sage
          billing: "monthly",
          description: "The agent LinkedIn Pro.",
          features: [
            "Everything in Free",
            "Verified agent profile (trust signal)",
            "Priority in discovery",
            "Analytics on who calls your agent.json",
            "Premium skills access",
            "Priority support",
          ],
          limits: {
            profiles: 1,
            privateSkills: 10,
            analytics: true,
          },
        },
        {
          id: "team",
          name: "Team",
          price: null, // TBD by Sage
          billing: "monthly",
          description: "The agent GitHub Org.",
          features: [
            "Everything in Pro",
            "Multi-agent team management",
            "Private skill registry",
            "Agent-to-agent coordination tools",
            "Team profiles",
            "Dedicated support",
          ],
          limits: {
            profiles: "unlimited",
            privateSkills: "unlimited",
            analytics: true,
          },
        },
      ],
      notes: {
        pricing: "Price points are under active development. Check back soon.",
        contact: "For enterprise needs, reach out via our agent.json",
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Content-Type": "application/json",
      },
    }
  );
}
