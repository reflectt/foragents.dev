/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import TemplatesPage from "@/app/templates/page";

jest.setTimeout(10_000);

// ---- Browser API polyfills ----
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - polyfill for tests
global.ResizeObserver = global.ResizeObserver ?? NoopObserver;
// @ts-expect-error - polyfill for tests
global.IntersectionObserver = global.IntersectionObserver ?? NoopObserver;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value:
    window.matchMedia ??
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
});

// ---- Next.js shims ----
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
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/templates",
  useParams: () => ({}),
}));

describe("/templates page", () => {
  test("renders without crashing", () => {
    const { container } = render(<TemplatesPage />);
    expect(container).toBeInTheDocument();
  });

  test("displays hero section with title", () => {
    render(<TemplatesPage />);
    expect(screen.getByText(/Skill Templates Gallery/i)).toBeInTheDocument();
  });

  test("displays hero description", () => {
    render(<TemplatesPage />);
    expect(
      screen.getByText(/Starter templates for building skills/i)
    ).toBeInTheDocument();
  });

  test("displays difficulty filter section", () => {
    render(<TemplatesPage />);
    expect(screen.getByText("Difficulty")).toBeInTheDocument();
    const allButtons = screen.getAllByText("All");
    expect(allButtons.length).toBeGreaterThan(0);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  test("displays category filter section", () => {
    render(<TemplatesPage />);
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  test("displays template cards", () => {
    render(<TemplatesPage />);
    // Check for at least one template card
    expect(screen.getByText("Hello World Skill")).toBeInTheDocument();
  });

  test("displays key templates", () => {
    render(<TemplatesPage />);
    expect(screen.getByText("Hello World Skill")).toBeInTheDocument();
    expect(screen.getByText("API Connector")).toBeInTheDocument();
    expect(screen.getByText("Data Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Chat Bot")).toBeInTheDocument();
    expect(screen.getByText("File Processor")).toBeInTheDocument();
    expect(screen.getByText("Web Scraper")).toBeInTheDocument();
    expect(screen.getByText("Notification Service")).toBeInTheDocument();
    expect(screen.getByText("Auth Integration")).toBeInTheDocument();
  });

  test("displays difficulty badges", () => {
    render(<TemplatesPage />);
    const beginnerBadges = screen.getAllByText("beginner");
    const intermediateBadges = screen.getAllByText("intermediate");
    const advancedBadges = screen.getAllByText("advanced");
    expect(beginnerBadges.length).toBeGreaterThan(0);
    expect(intermediateBadges.length).toBeGreaterThan(0);
    expect(advancedBadges.length).toBeGreaterThan(0);
  });

  test("displays estimated time for templates", () => {
    render(<TemplatesPage />);
    expect(screen.getByText("15 minutes")).toBeInTheDocument();
    const fortyFiveMinutes = screen.getAllByText("45 minutes");
    expect(fortyFiveMinutes.length).toBeGreaterThan(0);
  });

  test("displays view template buttons", () => {
    render(<TemplatesPage />);
    const viewButtons = screen.getAllByText(/View Template/i);
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  test("displays footer with links", () => {
    render(<TemplatesPage />);
    expect(screen.getByText("← Home")).toBeInTheDocument();
    expect(screen.getByText("Team Reflectt")).toBeInTheDocument();
  });
});
