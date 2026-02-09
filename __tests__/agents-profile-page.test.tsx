/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

type LinkProps = {
  href: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

jest.mock("next/link", () => {
  const LinkMock = ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = "Link";
  return LinkMock;
});

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock server helpers used by the page
jest.mock("@/lib/server/agentProfiles", () => ({
  getAgentProfileByHandle: jest.fn(async () => ({
    bio: "Kai bio override",
    installedSkills: ["agent-memory-kit"],
    stackTitle: "Kai’s Stack",
  })),
}));

jest.mock("@/lib/server/publicAgentActivity", () => ({
  listPublicAgentActivity: jest.fn(async () => ({
    items: [],
  })),
}));

// Mock components that rely on browser / complex internals
jest.mock("@/components/PremiumBadge", () => ({
  VerifiedBadge: () => <span>verified-badge</span>,
}));

jest.mock("@/components/collections/SaveToCollectionButton", () => ({
  SaveToCollectionButton: () => <button>Save</button>,
}));

jest.mock("@/components/recently-viewed/TrackRecentlyViewed", () => ({
  TrackRecentlyViewed: () => null,
}));

jest.mock("@/components/agents/AgentAvatar", () => ({
  AgentAvatar: ({ fallback }: { fallback: string }) => <span>{fallback}</span>,
}));

jest.mock("@/components/skill-version-badge", () => ({
  SkillVersionBadge: () => <span>vX</span>,
}));

// Minimal UI mocks
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    if (asChild && React.isValidElement(children)) return children;
    return <button>{children}</button>;
  },
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

import AgentProfilePage from "@/app/agents/[handle]/page";

describe("Agent Profile Page (/agents/[handle])", () => {
  test("renders agent name, handle, role", async () => {
    const element = await AgentProfilePage({ params: Promise.resolve({ handle: "kai" }) });
    render(element);

    expect(screen.getByRole("heading", { name: /Kai/i })).toBeInTheDocument();
    expect(screen.getByText("@kai@reflectt.ai")).toBeInTheDocument();
    expect(screen.getByText(/Lead Agent \/ Orchestrator/i)).toBeInTheDocument();
  });

  test("shows trust score when available", async () => {
    const element = await AgentProfilePage({ params: Promise.resolve({ handle: "kai" }) });
    render(element);

    expect(screen.getByText(/Trust Score/i)).toBeInTheDocument();
    expect(screen.getByText("98")).toBeInTheDocument();
  });

  test("shows connect CTA button when a link exists", async () => {
    const element = await AgentProfilePage({ params: Promise.resolve({ handle: "kai" }) });
    render(element);

    const connect = screen.getByRole("link", { name: /connect/i });
    expect(connect).toHaveAttribute("href", expect.stringContaining(".well-known/agent.json"));
  });

  test("renders installed skills section and links skills to /skills pages", async () => {
    const element = await AgentProfilePage({ params: Promise.resolve({ handle: "kai" }) });
    render(element);

    expect(screen.getByText(/Installed Skills/i)).toBeInTheDocument();
    const skillLink = screen.getByRole("link", { name: /Agent Memory Kit/i });
    expect(skillLink).toHaveAttribute("href", "/skills/agent-memory-kit");
  });

  test("renders enhanced milestones timeline when seeded activity exists", async () => {
    const element = await AgentProfilePage({ params: Promise.resolve({ handle: "kai" }) });
    render(element);

    expect(screen.getByText(/Recent Milestones/i)).toBeInTheDocument();
    expect(screen.getByText(/Orchestrated 26 new agent profiles/i)).toBeInTheDocument();
  });

  test("renders platforms list", async () => {
    const element = await AgentProfilePage({ params: Promise.resolve({ handle: "kai" }) });
    render(element);

    expect(screen.getByText(/Platforms/i)).toBeInTheDocument();
    expect(screen.getByText(/openclaw/i)).toBeInTheDocument();
  });

  test("throws notFound for missing agent", async () => {
    await expect(
      AgentProfilePage({ params: Promise.resolve({ handle: "this-agent-does-not-exist" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
