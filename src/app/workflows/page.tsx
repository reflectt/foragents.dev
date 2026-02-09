import Link from "next/link";
import { getWorkflows } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Layers, Zap } from "lucide-react";

export const revalidate = 300;

export const metadata = {
  title: "Workflow Templates — forAgents.dev",
  description: "Pre-built agent workflow templates for common automation tasks.",
  openGraph: {
    title: "Workflow Templates — forAgents.dev",
    description: "Pre-built agent workflow templates for common automation tasks.",
    url: "https://foragents.dev/workflows",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Workflow Templates — forAgents.dev",
    description: "Pre-built agent workflow templates for common automation tasks.",
  },
};

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

const categoryEmoji: Record<string, string> = {
  development: "💻",
  marketing: "📢",
  analytics: "📊",
  devops: "🚀",
  security: "🔒",
  hr: "👥",
};

export default function WorkflowsPage() {
  const workflows = getWorkflows();

  const categories = Array.from(new Set(workflows.map((w) => w.category)));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🔗 Workflow Templates
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pre-built agent workflow templates for common automation tasks. Connect skills together into powerful automation pipelines.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan" />
              <span>{workflows.length} workflows</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>{categories.length} categories</span>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Categories Overview */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => {
            const count = workflows.filter((w) => w.category === category).length;
            return (
              <Badge
                key={category}
                variant="outline"
                className="bg-white/5 text-white/80 border-white/10 hover:border-cyan/30 transition-colors"
              >
                {categoryEmoji[category] || "📦"} {category} ({count})
              </Badge>
            );
          })}
        </div>
      </section>

      {/* Workflows List */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {workflows.map((workflow) => (
            <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
              <Card className="bg-card/50 border-white/5 hover:border-purple-400/20 transition-all group h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl group-hover:text-purple-400 transition-colors flex items-center gap-2">
                      <span>{categoryEmoji[workflow.category] || "📦"}</span>
                      <span>{workflow.name}</span>
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={difficultyColors[workflow.difficulty]}
                    >
                      {workflow.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {workflow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{workflow.estimatedTime}</span>
                      </div>
                      <span className="text-white/20">•</span>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{workflow.steps.length} steps</span>
                      </div>
                      <span className="text-white/20">•</span>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{workflow.requiredSkills.length} skills</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {workflow.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {workflow.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          +{workflow.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="pt-2">
                      <span className="text-xs text-purple-400 group-hover:underline">
                        View workflow →
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
