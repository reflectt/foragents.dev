/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GlossaryPage from "@/app/glossary/page";

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
  usePathname: () => "/glossary",
  useParams: () => ({}),
}));

describe("/glossary page", () => {
  test("renders without crashing", () => {
    const { container } = render(<GlossaryPage />);
    expect(container).toBeInTheDocument();
  });

  test("displays hero section with title", () => {
    const { getByText } = render(<GlossaryPage />);
    expect(getByText("📖 Agent Terminology")).toBeInTheDocument();
    expect(
      getByText("Your comprehensive guide to AI agent concepts and protocols")
    ).toBeInTheDocument();
  });

  test("displays search input", () => {
    const { getByPlaceholderText } = render(<GlossaryPage />);
    const searchInput = getByPlaceholderText(
      "Search terms, definitions, or concepts..."
    );
    expect(searchInput).toBeInTheDocument();
  });

  test("displays alphabet navigation", () => {
    const { getByLabelText } = render(<GlossaryPage />);
    expect(getByLabelText("Filter by letter A")).toBeInTheDocument();
    expect(getByLabelText("Filter by letter Z")).toBeInTheDocument();
  });

  test("displays glossary terms", () => {
    const { getAllByText } = render(<GlossaryPage />);
    // Check for some key terms that should be in the glossary
    // Use getAllByText since terms appear multiple times (as headings and as links)
    expect(getAllByText("Agent").length).toBeGreaterThan(0);
    expect(getAllByText("MCP").length).toBeGreaterThan(0);
    expect(getAllByText("Tool").length).toBeGreaterThan(0);
  });

  test("search functionality filters terms", async () => {
    const { getByPlaceholderText, getAllByText } = render(
      <GlossaryPage />
    );
    const searchInput = getByPlaceholderText(
      "Search terms, definitions, or concepts..."
    );

    // Search for "agent"
    fireEvent.change(searchInput, { target: { value: "agent" } });

    await waitFor(() => {
      // Use getAllByText since "Agent" appears multiple times
      expect(getAllByText("Agent").length).toBeGreaterThan(0);
      // Terms not matching "agent" should not be visible or should be filtered out
    });
  });

  test("alphabet filter works", async () => {
    const { getByLabelText } = render(<GlossaryPage />);
    const letterA = getByLabelText("Filter by letter A");

    // Click on letter A
    fireEvent.click(letterA);

    await waitFor(() => {
      // The letter A button should be highlighted
      expect(letterA).toHaveClass("bg-[#06D6A0]");
    });
  });

  test("clear filters button appears when filtering", async () => {
    const { getByPlaceholderText, getByText } = render(<GlossaryPage />);
    const searchInput = getByPlaceholderText(
      "Search terms, definitions, or concepts..."
    );

    // Trigger search
    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(getByText("Clear filters")).toBeInTheDocument();
    });
  });

  test("displays related terms section", () => {
    const { getAllByText } = render(<GlossaryPage />);
    // Should have at least one "Related:" label
    const relatedLabels = getAllByText("Related:");
    expect(relatedLabels.length).toBeGreaterThan(0);
  });

  test("displays see also section", () => {
    const { getAllByText } = render(<GlossaryPage />);
    // Should have at least one "See also:" label
    const seeAlsoLabels = getAllByText("See also:");
    expect(seeAlsoLabels.length).toBeGreaterThan(0);
  });

  test("displays CTA section", () => {
    const { getByText } = render(<GlossaryPage />);
    expect(getByText("Ready to Build?")).toBeInTheDocument();
    expect(getByText("Browse Skills →")).toBeInTheDocument();
    expect(getByText("Start Learning")).toBeInTheDocument();
  });

  test("displays empty state when no results found", async () => {
    const { getByPlaceholderText, getByText } = render(<GlossaryPage />);
    const searchInput = getByPlaceholderText(
      "Search terms, definitions, or concepts..."
    );

    // Search for something that doesn't exist
    fireEvent.change(searchInput, {
      target: { value: "xyznonexistentterm123" },
    });

    await waitFor(() => {
      expect(getByText("No terms found")).toBeInTheDocument();
      expect(getByText("Show all terms")).toBeInTheDocument();
    });
  });

  test("shows result count when filtering", async () => {
    const { getByPlaceholderText, getByText } = render(<GlossaryPage />);
    const searchInput = getByPlaceholderText(
      "Search terms, definitions, or concepts..."
    );

    // Search for "protocol"
    fireEvent.change(searchInput, { target: { value: "protocol" } });

    await waitFor(() => {
      // Should show "X terms found" or "X term found"
      const resultText = screen.getByText(/\d+ terms? found/);
      expect(resultText).toBeInTheDocument();
    });
  });

  test("contains minimum 30 terms", () => {
    render(<GlossaryPage />);
    // Count the number of term entries by checking for elements with specific structure
    // Each term has an id attribute on its container
    const termElements = document.querySelectorAll("[id][class*='scroll-mt']");
    expect(termElements.length).toBeGreaterThanOrEqual(30);
  });
});
