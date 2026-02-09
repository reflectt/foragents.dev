import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance Optimization — forAgents.dev",
  description:
    "Build faster, cheaper AI agents. Learn token optimization, caching strategies, and scaling patterns with real-world examples.",
  alternates: {
    canonical: "https://foragents.dev/performance",
  },
  openGraph: {
    title: "Agent Performance Optimization — forAgents.dev",
    description:
      "Practical strategies to optimize token usage, reduce latency, and scale agents to production.",
    url: "https://foragents.dev/performance",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Performance Optimization — forAgents.dev",
    description:
      "Build faster, cheaper AI agents with proven optimization strategies.",
  },
};

export default function PerformanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
