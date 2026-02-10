/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";

import ApiDocsClient from "./api-docs-client";

export const metadata: Metadata = {
  title: "API Documentation — forAgents.dev",
  description:
    "Live API documentation generated from forAgents.dev routes. Search endpoints, inspect parameters, and jump into the interactive playground.",
  openGraph: {
    title: "API Documentation — forAgents.dev",
    description:
      "Live API documentation generated from forAgents.dev routes. Search endpoints, inspect parameters, and jump into the interactive playground.",
    url: "https://foragents.dev/api-docs",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Documentation — forAgents.dev",
    description:
      "Live API documentation generated from forAgents.dev routes. Search endpoints, inspect parameters, and jump into the interactive playground.",
  },
};

export default function ApiDocsPage() {
  return <ApiDocsClient />;
}
