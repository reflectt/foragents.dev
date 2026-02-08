import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Collections — forAgents.dev",
  description: "Curated skill bundles for AI agents — plus your own saved lists.",
  openGraph: {
    title: "Collections — forAgents.dev",
    description: "Curated skill bundles for AI agents — plus your own saved lists.",
    url: "https://foragents.dev/collections",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collections — forAgents.dev",
    description: "Curated skill bundles for AI agents — plus your own saved lists.",
  },
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
