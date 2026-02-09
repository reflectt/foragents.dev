import { getTemplates, getTemplateById, type TemplateDifficulty } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateDetailClient } from "./template-detail-client";
import { Clock, Code2, Layers, FileCode } from "lucide-react";

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

// Generate static paths for all templates
export function generateStaticParams() {
  return getTemplates().map((template) => ({ id: template.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = getTemplateById(id);
  
  if (!template) return { title: "Template Not Found" };

  return {
    title: `${template.name} — Skill Template — forAgents.dev`,
    description: template.description,
    openGraph: {
      title: `${template.name} — Skill Template`,
      description: template.description,
      url: `https://foragents.dev/templates/${id}`,
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(template.name)}&subtitle=Skill%20Template`,
          width: 1200,
          height: 630,
          alt: `${template.name} — Skill Template`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.name} — Skill Template`,
      description: template.description,
      images: [`/api/og?title=${encodeURIComponent(template.name)}&subtitle=Skill%20Template`],
    },
  };
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  const relatedTemplates = getTemplates()
    .filter((t) => t.id !== template.id && (t.category === template.category || t.difficulty === template.difficulty))
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-4">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan transition-colors"
            >
              ← Back to Templates
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">{template.name}</h1>
          <p className="text-lg text-muted-foreground mb-6">{template.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Badge 
              variant="outline" 
              className={`text-sm capitalize ${difficultyColors[template.difficulty as TemplateDifficulty]}`}
            >
              {template.difficulty}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{template.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code2 className="w-4 h-4" />
              <span>{template.language}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="w-4 h-4" />
              <span>{template.framework}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Tags */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-4">🏷️ Tags</h2>
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        {/* File Tree */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <FileCode className="w-6 h-6" />
            File Structure
          </h2>
          <div className="rounded-lg border border-white/5 bg-card/40 p-6">
            <div className="font-mono text-sm space-y-1">
              {template.fileTree.map((file, index) => (
                <div key={index} className="text-foreground/80 flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {file.endsWith("/") ? "📁" : "📄"}
                  </span>
                  <span>{file}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code Snippets (with client-side copy buttons) */}
        <TemplateDetailClient codeSnippets={template.codeSnippets} />

        {/* Use This Template */}
        <section className="mb-12">
          <div className="rounded-lg border border-cyan/20 bg-cyan/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">🚀 Ready to Build?</h2>
            <p className="text-muted-foreground mb-6">
              Copy the code snippets above and follow the file structure to create your skill.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-white rounded-lg font-semibold hover:bg-cyan/90 transition-colors"
              >
                View Documentation
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-[#F8FAFC] rounded-lg font-semibold hover:border-cyan/50 transition-colors"
              >
                Submit Your Skill
              </Link>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">📚 Getting Started</h2>
          <div className="rounded-lg border border-white/5 bg-card/40 p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">1. Set up your project</h3>
              <p className="text-sm text-muted-foreground">
                Create the file structure shown above in your project directory.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">2. Copy the code</h3>
              <p className="text-sm text-muted-foreground">
                Use the code snippets as starting points. Click the copy button on each snippet to copy to your clipboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">3. Customize</h3>
              <p className="text-sm text-muted-foreground">
                Adapt the template to your specific needs. Add features, modify logic, and make it your own.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">4. Test & Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Test your skill thoroughly, then deploy and share it with the community!
              </p>
            </div>
          </div>
        </section>

        {/* Related Templates */}
        {relatedTemplates.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">🔗 Related Templates</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedTemplates.map((related) => (
                <Link
                  key={related.id}
                  href={`/templates/${related.id}`}
                  className="rounded-lg border border-white/5 bg-card/40 p-4 hover:border-cyan/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                      {related.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${difficultyColors[related.difficulty as TemplateDifficulty]}`}
                    >
                      {related.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {related.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{related.estimatedTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/templates" className="hover:text-cyan transition-colors">
            ← Back to Templates
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
