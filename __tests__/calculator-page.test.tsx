/** @jest-environment jsdom */
import React from "react";
import { render } from "@testing-library/react";

jest.setTimeout(10_000);

class NoopObserver { observe() {} unobserve() {} disconnect() {} }
// @ts-expect-error - polyfill for tests
global.ResizeObserver = global.ResizeObserver ?? NoopObserver;
// @ts-expect-error - polyfill for tests
global.IntersectionObserver = global.IntersectionObserver ?? NoopObserver;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: window.matchMedia ?? ((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  })),
});

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
  usePathname: () => "/calculator",
  useParams: () => ({}),
}));

describe("Calculator Page", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ presets: [] }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders without crashing", async () => {
    const CalculatorPage = (await import("@/app/calculator/page")).default;
    const { container } = render(<CalculatorPage />);
    expect(container).toBeInTheDocument();
  });

  it("renders calculator content", async () => {
    const CalculatorPage = (await import("@/app/calculator/page")).default;
    const { container } = render(<CalculatorPage />);
    expect(container.textContent).toMatch(/calculator/i);
  });
});
