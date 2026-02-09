/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

jest.setTimeout(10_000);

// ---- Browser API polyfills commonly used by UI libs ----
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

Object.defineProperty(navigator, "clipboard", {
  writable: true,
  value: {
    writeText: jest.fn(() => Promise.resolve()),
  },
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
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/blog",
  useParams: () => ({}),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

jest.mock("next/headers", () => ({
  headers: () => new Map([["host", "localhost:3000"], ["x-forwarded-proto", "http"]]),
  cookies: () => ({ get: () => undefined, getAll: () => [] }),
}));

// ---- Mock data ----

jest.mock("@/lib/data", () => ({
  getBlogPosts: jest.fn(() => [
    {
      slug: "test-post",
      title: "Test Post",
      excerpt: "This is a test post excerpt",
      category: "Engineering",
      author: {
        name: "Test Author",
        role: "Engineer",
        avatar: "/test-avatar.png",
        bio: "Test bio",
      },
      publishedAt: "2026-02-01T10:00:00Z",
      readingTime: "5 min read",
      tags: ["test", "blog"],
      content: [
        { type: "paragraph" as const, text: "Test content paragraph 1" },
        { type: "heading" as const, text: "Test Heading" },
        { type: "paragraph" as const, text: "Test content paragraph 2" },
      ],
    },
  ]),
  getBlogPostBySlug: jest.fn((slug: string) => {
    if (slug === "test-post") {
      return {
        slug: "test-post",
        title: "Test Post",
        excerpt: "This is a test post excerpt",
        category: "Engineering",
        author: {
          name: "Test Author",
          role: "Engineer",
          avatar: "/test-avatar.png",
          bio: "Test author biography",
        },
        publishedAt: "2026-02-01T10:00:00Z",
        readingTime: "5 min read",
        tags: ["test", "blog"],
        content: [
          { type: "paragraph" as const, text: "Test content paragraph 1" },
          { type: "heading" as const, text: "Test Heading" },
          { type: "paragraph" as const, text: "Test content paragraph 2" },
        ],
      };
    }
    return undefined;
  }),
  getBlogCategories: jest.fn(() => ["Engineering", "Product", "Community"]),
  getRelatedBlogPosts: jest.fn(() => [
    {
      slug: "related-post",
      title: "Related Post",
      excerpt: "This is a related post",
      category: "Engineering",
      author: {
        name: "Related Author",
        role: "Engineer",
        avatar: "/related-avatar.png",
        bio: "Related bio",
      },
      publishedAt: "2026-02-02T10:00:00Z",
      readingTime: "3 min read",
      tags: ["test"],
      content: [],
    },
  ]),
}));

async function renderPageModule(importPath: string, props: Record<string, unknown> = {}) {
  const mod: Record<string, unknown> = await import(importPath);
  const Page = mod.default;

  expect(Page).toBeTruthy();

  // Next.js server components are often `async function`.
  if (Page?.constructor?.name === "AsyncFunction") {
    const element = await (Page as (p: Record<string, unknown>) => Promise<React.ReactElement>)(props);
    const { container } = render(element);
    expect(container).toBeInTheDocument();
    return container;
  }

  const { container } = render(React.createElement(Page as React.ComponentType, props));
  expect(container).toBeInTheDocument();
  return container;
}

describe("Blog pages render smoke tests", () => {
  test("/blog renders without crashing", async () => {
    const container = await renderPageModule("@/app/blog/page");
    
    // Check for key elements
    expect(container.textContent).toContain("Blog");
    expect(container.textContent).toContain("Insights, updates, and perspectives");
  });

  test("/blog/[slug] renders without crashing", async () => {
    const container = await renderPageModule("@/app/blog/[slug]/page", {
      params: { slug: "test-post" },
    });
    
    // Check for key elements
    expect(container.textContent).toContain("Test Post");
    expect(container.textContent).toContain("Test content paragraph 1");
    expect(container.textContent).toContain("Test Author");
    expect(container.textContent).toContain("Engineer");
  });

  test("/blog/[slug] shows 404 for non-existent post", async () => {
    await expect(
      renderPageModule("@/app/blog/[slug]/page", {
        params: { slug: "non-existent-post" },
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("Blog components", () => {
  test("BlogGrid component renders", async () => {
    const { getBlogPosts, getBlogCategories } = await import("@/lib/data");
    const { BlogGrid } = await import("@/components/blog/blog-grid");
    
    const posts = getBlogPosts();
    const categories = getBlogCategories();
    
    render(<BlogGrid posts={posts} categories={categories} />);
    
    // Check that posts are rendered
    expect(screen.getByText("Test Post")).toBeInTheDocument();
    expect(screen.getByText("This is a test post excerpt")).toBeInTheDocument();
  });

  test("ShareButtons component renders", async () => {
    const { ShareButtons } = await import("@/components/blog/share-buttons");
    
    render(<ShareButtons url="https://test.com" title="Test" />);
    
    // Check for share buttons
    expect(screen.getByText("Twitter")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });
});
