import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Careers — forAgents.dev",
  description: "Join the forAgents.dev team and help build the future of AI agent development. Remote-first, open source, cutting-edge AI.",
  openGraph: {
    title: "Careers — forAgents.dev",
    description: "Join the forAgents.dev team and help build the future of AI agent development. Remote-first, open source, cutting-edge AI.",
    url: "https://foragents.dev/careers",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
