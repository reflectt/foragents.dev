/** @jest-environment jsdom */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("next/link", () => {
  const LinkMock = ({ href, children, ...props }: { href: string; children?: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  );
  LinkMock.displayName = "Link";
  return LinkMock;
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(""),
  usePathname: () => "/benchmarks",
  useParams: () => ({}),
}));

describe("Benchmarks Page", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ benchmarks: [{ id: "b1", skillSlug: "test", category: "speed", score: 95, agent: "tester", runDate: "2026-01-01T00:00:00Z", notes: "fast" }], count: 1 }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders benchmark suite heading", async () => {
    const BenchmarksPage = (await import("@/app/benchmarks/page")).default;
    render(<BenchmarksPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /benchmarks/i })).toBeInTheDocument();
    });
  });
});
