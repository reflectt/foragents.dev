import { Metadata } from "next";
import UseCasesClient from "./use-cases-client";

export const metadata: Metadata = {
  title: "Real-World Agent Use Cases | forAgents.dev",
  description: "Discover how AI agents are transforming workflows across development, productivity, communication, and data analysis. Explore practical use cases with related skills.",
  openGraph: {
    title: "Real-World Agent Use Cases | forAgents.dev",
    description: "Discover how AI agents are transforming workflows across development, productivity, communication, and data analysis.",
    url: "https://foragents.dev/use-cases",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Real-World Agent Use Cases | forAgents.dev",
    description: "Discover how AI agents are transforming workflows across development, productivity, communication, and data analysis.",
  },
};

export default function UseCasesPage() {
  return <UseCasesClient />;
}
