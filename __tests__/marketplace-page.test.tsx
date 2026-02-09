/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MarketplacePage from "@/app/marketplace/page";
import marketplaceData from "@/data/marketplace.json";

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
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/marketplace",
}));

// Mock window.alert for dialog interactions
global.alert = jest.fn();

describe("Marketplace Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the marketplace page without crashing", () => {
    render(<MarketplacePage />);
    
    // Check for main heading
    expect(screen.getByText(/Agent Marketplace/i)).toBeInTheDocument();
  });

  it("displays the correct page title and description", () => {
    render(<MarketplacePage />);
    
    expect(screen.getByText(/Agent Marketplace/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Discover and review AI agents for your team/i)
    ).toBeInTheDocument();
  });

  it("displays marketplace statistics", () => {
    render(<MarketplacePage />);
    
    // Should show total agents count
    const totalAgents = marketplaceData.length;
    expect(screen.getByText(totalAgents.toString())).toBeInTheDocument();
    expect(screen.getAllByText(/agents/i).length).toBeGreaterThan(0);
    
    // Should show verified count
    const verifiedCount = marketplaceData.filter((a) => a.verified).length;
    expect(screen.getByText(verifiedCount.toString())).toBeInTheDocument();
    expect(screen.getAllByText(/verified/i).length).toBeGreaterThan(0);
  });

  it("renders featured agents banner with editor's picks", () => {
    render(<MarketplacePage />);
    
    // Should have "Editor's Picks" heading
    expect(screen.getByText(/Editor's Picks/i)).toBeInTheDocument();
    
    // Should display featured agents
    const featuredAgents = marketplaceData.filter((a) => a.featured);
    featuredAgents.forEach((agent) => {
      // Should find agent names in featured section (may appear multiple times)
      const agentElements = screen.getAllByText(agent.name);
      expect(agentElements.length).toBeGreaterThan(0);
    });
  });

  it("renders all category tabs", () => {
    render(<MarketplacePage />);
    
    // Check for all required category tabs (rendered as buttons in shadcn/ui, may include emojis)
    const categories = ["All", "DevOps", "Data", "Security", "Communication", "Productivity"];
    
    categories.forEach((category) => {
      const buttons = screen.getAllByRole("button");
      const found = buttons.some(button => 
        button.textContent?.toLowerCase().includes(category.toLowerCase())
      );
      expect(found).toBe(true);
    });
  });

  it("renders all sorting options", () => {
    render(<MarketplacePage />);
    
    // Check for all sorting options
    expect(screen.getByText("Sort by:")).toBeInTheDocument();
    expect(screen.getByText("Most Popular")).toBeInTheDocument();
    expect(screen.getByText("Highest Rated")).toBeInTheDocument();
    expect(screen.getByText("Newest")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
  });

  it("filters agents by category when clicking category tabs", () => {
    render(<MarketplacePage />);
    
    // Click on DevOps tab (rendered as button)
    const devOpsTab = screen.getByRole("button", { name: /DevOps/i });
    fireEvent.click(devOpsTab);
    
    // Should show filtered results
    const showingText = screen.getByText(/Showing \d+ of \d+ agents/i);
    expect(showingText).toBeInTheDocument();
  });

  it("sorts agents by different criteria", () => {
    render(<MarketplacePage />);
    
    // Click "Highest Rated" sort button
    const highestRatedButton = screen.getByText("Highest Rated");
    fireEvent.click(highestRatedButton);
    
    // Button should be highlighted (has active styling)
    expect(highestRatedButton).toHaveClass(/purple/);
  });

  it("renders agent cards with required information", () => {
    render(<MarketplacePage />);
    
    // Pick the first agent to verify card structure
    const firstAgent = marketplaceData[0];
    
    // Should display agent name
    expect(screen.getAllByText(firstAgent.name)[0]).toBeInTheDocument();
    
    // Should display rating
    expect(screen.getAllByText(firstAgent.rating.toFixed(1))[0]).toBeInTheDocument();
    
    // Should display review count
    const reviewText = new RegExp(`${firstAgent.reviewCount} reviews?`, "i");
    expect(screen.getByText(reviewText)).toBeInTheDocument();
    
    // Should display creator
    expect(screen.getAllByText(new RegExp(firstAgent.creator, "i"))[0]).toBeInTheDocument();
    
    // Should display pricing
    expect(screen.getAllByText(firstAgent.pricing.toUpperCase())[0]).toBeInTheDocument();
  });

  it("expands and collapses reviews when clicking 'View Reviews'", () => {
    render(<MarketplacePage />);
    
    // Find a "View Reviews" button
    const viewReviewsButton = screen.getAllByText(/View Reviews/i)[0];
    
    // Click to expand reviews
    fireEvent.click(viewReviewsButton);
    
    // Should now show "Hide Reviews" text
    expect(screen.getByText(/Hide Reviews/i)).toBeInTheDocument();
    
    // Star ratings should appear (reviews are now visible)
    const allStars = screen.getAllByText("★");
    expect(allStars.length).toBeGreaterThan(0);
  });

  it("renders review cards with star ratings, author, date, and text", () => {
    render(<MarketplacePage />);
    
    // Expand reviews for an agent
    const viewReviewsButtons = screen.getAllByText(/View Reviews/i);
    fireEvent.click(viewReviewsButtons[0]);
    
    // Star ratings should be rendered (5 stars per review)
    const stars = screen.getAllByText("★");
    expect(stars.length).toBeGreaterThanOrEqual(5);
    
    // Reviews should have dates (check for date format)
    const datePattern = /\w{3} \d{1,2}, \d{4}/; // e.g., "Feb 5, 2026"
    expect(screen.getAllByText(datePattern).length).toBeGreaterThan(0);
  });

  it("opens 'Write a Review' dialog when clicking the button", () => {
    render(<MarketplacePage />);
    
    // Find and click the first "Write a Review" button
    const writeReviewButtons = screen.getAllByText("Write a Review");
    fireEvent.click(writeReviewButtons[0]);
    
    // Dialog should open with title
    expect(screen.getByText(/Write a Review for/i)).toBeInTheDocument();
    
    // Dialog should have form fields
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Rating/i)).toBeInTheDocument();
  });

  it("allows user to submit a review from the dialog", () => {
    render(<MarketplacePage />);
    
    // Open the write review dialog
    const writeReviewButtons = screen.getAllByText("Write a Review");
    fireEvent.click(writeReviewButtons[0]);
    
    // Fill in the form
    const nameInput = screen.getByLabelText(/Your Name/i);
    const reviewInput = screen.getByLabelText(/Your Review/i);
    
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(reviewInput, { target: { value: "This is a test review!" } });
    
    // Submit the review
    const submitButton = screen.getByText("Submit Review");
    fireEvent.click(submitButton);
    
    // Should trigger alert (mocked)
    expect(global.alert).toHaveBeenCalled();
  });

  it("renders install/deploy buttons for all agents", () => {
    render(<MarketplacePage />);
    
    // Should have multiple "Install Agent" buttons
    const installButtons = screen.getAllByText("Install Agent");
    expect(installButtons.length).toBeGreaterThan(0);
  });

  it("handles agent installation when clicking install button", () => {
    render(<MarketplacePage />);
    
    // Click the first install button
    const installButtons = screen.getAllByText("Install Agent");
    fireEvent.click(installButtons[0]);
    
    // Should show "Installing..." state
    expect(screen.getByText("Installing...")).toBeInTheDocument();
  });

  it("filters agents based on search query", () => {
    render(<MarketplacePage />);
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText(/Search agents/i);
    
    // Type a search query
    fireEvent.change(searchInput, { target: { value: "data" } });
    
    // Should filter results
    const showingText = screen.getByText(/Showing \d+ of \d+ agents/i);
    expect(showingText).toBeInTheDocument();
  });

  it("displays 'No agents found' when search yields no results", () => {
    render(<MarketplacePage />);
    
    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText(/Search agents/i);
    fireEvent.change(searchInput, { target: { value: "xyz123nonexistent" } });
    
    // Should show no results message
    expect(screen.getByText(/No agents found/i)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search or filters/i)).toBeInTheDocument();
  });

  it("displays verified badges for verified agents", () => {
    render(<MarketplacePage />);
    
    // Count verified agents in data
    const verifiedAgents = marketplaceData.filter((a) => a.verified);
    
    // Should have verified badges (✓)
    const badges = screen.getAllByText("✓");
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.length).toBeGreaterThanOrEqual(verifiedAgents.length);
  });

  it("displays agent capabilities as badges", () => {
    render(<MarketplacePage />);
    
    // Should show "Capabilities:" label
    const capabilityLabels = screen.getAllByText("Capabilities:");
    expect(capabilityLabels.length).toBeGreaterThan(0);
    
    // Should display some capability badges
    const firstAgent = marketplaceData[0];
    if (firstAgent.capabilities && firstAgent.capabilities.length > 0) {
      // At least first 3 capabilities should be shown
      const firstCap = firstAgent.capabilities[0];
      expect(screen.getByText(firstCap)).toBeInTheDocument();
    }
  });

  it("renders marketplace with at least 10 agents", () => {
    render(<MarketplacePage />);
    
    // Verify we have at least 10 agents in the data
    expect(marketplaceData.length).toBeGreaterThanOrEqual(10);
    
    // Verify the count is displayed
    const showingText = screen.getByText(/Showing \d+ of \d+ agents/i);
    expect(showingText).toBeInTheDocument();
  });

  it("includes all required categories in the data", () => {
    const categories = marketplaceData.map((a) => a.category);
    const uniqueCategories = [...new Set(categories)];
    
    // Should include required categories
    const requiredCategories = ["DevOps", "Data", "Security", "Communication", "Productivity"];
    
    requiredCategories.forEach((cat) => {
      expect(uniqueCategories).toContain(cat);
    });
  });

  it("ensures all agents have reviews", () => {
    marketplaceData.forEach((agent) => {
      expect(agent.reviews).toBeDefined();
      expect(Array.isArray(agent.reviews)).toBe(true);
      expect(agent.reviews.length).toBeGreaterThan(0);
    });
  });

  it("ensures all reviews have required fields", () => {
    marketplaceData.forEach((agent) => {
      agent.reviews.forEach((review) => {
        expect(review.id).toBeDefined();
        expect(review.author).toBeDefined();
        expect(review.rating).toBeDefined();
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
        expect(review.text).toBeDefined();
        expect(review.date).toBeDefined();
      });
    });
  });

  it("renders JSON-LD structured data", () => {
    const { container } = render(<MarketplacePage />);
    
    // Check for JSON-LD script tag
    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeInTheDocument();
    
    if (jsonLdScript?.textContent) {
      const jsonLd = JSON.parse(jsonLdScript.textContent);
      expect(jsonLd["@type"]).toBe("CollectionPage");
      expect(jsonLd.name).toBe("Agent Marketplace");
      expect(jsonLd.numberOfItems).toBe(marketplaceData.length);
    }
  });
});
