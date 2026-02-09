import type { Metadata } from "next";
import SitemapClient from "./sitemap-client";

export const metadata: Metadata = {
  title: "Sitemap — forAgents.dev",
  description: "Complete directory of all pages on forAgents.dev. Browse all skills, agents, resources, and documentation organized by category.",
  openGraph: {
    title: "Sitemap — forAgents.dev",
    description: "Complete directory of all pages on forAgents.dev",
    url: "https://foragents.dev/site-map",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function SitemapPage() {
  return <SitemapClient />;
}
