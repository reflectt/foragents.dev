import { getTemplates } from "@/lib/data";
import Link from "next/link";
import { TemplatesClient } from "./templates-client";

export const metadata = {
  title: "Skill Templates — forAgents.dev",
  description:
    "Starter templates for building skills. Pre-configured setups with code examples, file structures, and best practices.",
  openGraph: {
    title: "Skill Templates — forAgents.dev",
    description:
      "Starter templates for building skills. Pre-configured setups with code examples, file structures, and best practices.",
    url: "https://foragents.dev/templates",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Skill%20Templates&subtitle=Build%20Faster",
        width: 1200,
        height: 630,
        alt: "Skill Templates — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Templates — forAgents.dev",
    description:
      "Starter templates for building skills. Pre-configured setups with code examples, file structures, and best practices.",
    images: ["/api/og?title=Skill%20Templates&subtitle=Build%20Faster"],
  },
};

export default function TemplatesPage() {
  const templates = getTemplates();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Skill Templates",
    description: "Starter templates for building skills",
    url: "https://foragents.dev/templates",
    numberOfItems: templates.length,
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#F8FAFC] mb-4">
              🎨 Skill Templates Gallery
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Starter templates for building skills. Pre-configured setups with
              code examples, file structures, and best practices.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-cyan font-semibold">
                  {templates.length}
                </span>
                <span>templates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client-side filtering and grid */}
      <TemplatesClient templates={templates} />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="hover:text-cyan transition-colors">
            ← Home
          </Link>
          <a
            href="https://reflectt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-text font-semibold hover:opacity-80 transition-opacity"
          >
            Team Reflectt
          </a>
        </div>
      </footer>
    </div>
  );
}
