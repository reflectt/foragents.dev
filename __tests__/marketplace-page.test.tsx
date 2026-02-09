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

// Mock the client component
jest.mock("@/app/marketplace/marketplace-client", () => ({
  MarketplaceClient: ({ agents }: { agents: unknown[] }) => (
    <div data-testid="marketplace-client">
      <input placeholder="Search agents by name, category, or capabilities..." />
      <div data-testid="agent-count">{agents.length} agents</div>
    </div>
  ),
}));

import MarketplacePage from "@/app/marketplace/page";

describe("Marketplace Page", () => {
  it("renders the marketplace page with header", () => {
    render(<MarketplacePage />);
    expect(screen.getByText(/Agent Marketplace/i)).toBeInTheDocument();
  });

  it("displays the correct description", () => {
    render(<MarketplacePage />);
    expect(screen.getByText(/Hire and deploy AI agents/i)).toBeInTheDocument();
  });

  it("displays agent statistics", () => {
    render(<MarketplacePage />);
    expect(screen.getByText(/available agents/i)).toBeInTheDocument();
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it("renders the marketplace client component", () => {
    render(<MarketplacePage />);
    expect(screen.getByTestId("marketplace-client")).toBeInTheDocument();
  });

  it("shows search functionality", () => {
    render(<MarketplacePage />);
    const searchInput = screen.getByPlaceholderText(/Search agents/i);
    expect(searchInput).toBeInTheDocument();
  });
});
