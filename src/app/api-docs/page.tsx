import type { Metadata } from "next";
import ApiDocsClient from "./api-docs-client";
import apiDataRaw from "@/data/api-endpoints.json";

// Type assertion for JSON data
const apiData = apiDataRaw as unknown as Parameters<typeof ApiDocsClient>[0]["data"];

export const metadata: Metadata = {
  title: "API Documentation — forAgents.dev",
  description:
    "Complete API reference for forAgents.dev. Access skills, agents, reviews, collections, health monitoring, and search endpoints programmatically.",
  openGraph: {
    title: "API Documentation — forAgents.dev",
    description:
      "Complete API reference for forAgents.dev. Access skills, agents, reviews, collections, health monitoring, and search endpoints programmatically.",
    url: "https://foragents.dev/api-docs",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Documentation — forAgents.dev",
    description:
      "Complete API reference for forAgents.dev. Access skills, agents, reviews, collections, health monitoring, and search endpoints programmatically.",
  },
};

export default function ApiDocsPage() {
  return <ApiDocsClient data={apiData} />;
}
