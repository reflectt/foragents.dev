/** @jest-environment jsdom */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

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

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

jest.mock("next/link", () => {
  const LinkMock = ({ href, children, ...props }: { href: string; children?: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  );
  LinkMock.displayName = "Link";
  return LinkMock;
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/migrate",
  useParams: () => ({}),
}));

describe("/migrate page", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ guides: [] }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders without crashing", async () => {
    const MigratePage = (await import("@/app/migrate/page")).default;
    const { container } = render(<MigratePage />);
    expect(container).toBeInTheDocument();
  });

  test("renders migrate heading", async () => {
    const MigratePage = (await import("@/app/migrate/page")).default;
    render(<MigratePage />);
    await waitFor(() => {
      expect(screen.getByText(/migrate/i)).toBeInTheDocument();
    });
  });
});
