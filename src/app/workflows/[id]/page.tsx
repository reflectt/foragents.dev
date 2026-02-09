import { notFound } from "next/navigation";
import Link from "next/link";
import { getWorkflows, getWorkflowById, getSkills } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowRight, Check, Clock, Layers, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return getWorkflows().map((workflow) => ({ id: workflow.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const workflow = getWorkflowById(params.id);
  if (!workflow) return { title: "Workflow Not Found" };

  return {
    title: `${workflow.name} Workflow — forAgents.dev`,
    description: workflow.description,
    openGraph: {
      title: `${workflow.name} Workflow — forAgents.dev`,
      description: workflow.description,
      url: `https://foragents.dev/workflows/${workflow.id}`,
      siteName: "forAgents.dev",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${workflow.name} Workflow — forAgents.dev`,
      description: workflow.description,
    },
  };
}

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

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = getWorkflowById(id);

  if (!workflow) notFound();

  const allSkills = getSkills();
  const skillMap = new Map(allSkills.map((s) => [s.slug, s]));

  // Map required skills to actual skill objects
  const requiredSkillObjects = workflow.requiredSkills
    .map((slug) => skillMap.get(slug))
    .filter((s) => s !== undefined);

  const automatedStepsCount = workflow.steps.filter((s) => s.automated).length;
  const automationPercentage = Math.round(
    (automatedStepsCount / workflow.steps.length) * 100
  );

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: "Workflows", href: "/workflows" },
            { label: workflow.name },
          ]}
        />
      </div>

      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-5xl">{categoryEmoji[workflow.category] || "📦"}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC]">
                  {workflow.name}
                </h1>
                <Badge
                  variant="outline"
                  className={difficultyColors[workflow.difficulty]}
                >
                  {workflow.difficulty}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-6">{workflow.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan" />
                  <span>{workflow.estimatedTime}</span>
                </div>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>{workflow.steps.length} steps</span>
                </div>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span>{automationPercentage}% automated</span>
                </div>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline" className="bg-white/5 border-white/10">
                    {workflow.category}
                  </Badge>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {workflow.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-white/5 text-white/60 border-white/10"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          {/* Left Column: Steps */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Workflow Steps</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Follow these steps to implement the {workflow.name.toLowerCase()} workflow. 
                {automatedStepsCount > 0 && (
                  <> {automatedStepsCount} out of {workflow.steps.length} steps can be fully automated.</>
                )}
              </p>
            </div>

            <div className="space-y-4">
              {workflow.steps.map((step, index) => (
                <Card
                  key={step.id}
                  className="bg-card/50 border-white/5 hover:border-purple-400/20 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{step.name}</CardTitle>
                          {step.automated && (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-400 border-green-500/20 text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {step.skills.length > 0 && (
                    <CardContent>
                      <div className="text-xs text-muted-foreground mb-2">
                        Required skills:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.skills.map((skillSlug) => {
                          const skill = skillMap.get(skillSlug);
                          return skill ? (
                            <Link key={skillSlug} href={`/skills/${skillSlug}`}>
                              <Badge
                                variant="outline"
                                className="bg-cyan/5 text-cyan border-cyan/20 hover:bg-cyan/10 transition-colors cursor-pointer"
                              >
                                {skill.name}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Badge>
                            </Link>
                          ) : (
                            <Badge
                              key={skillSlug}
                              variant="outline"
                              className="bg-white/5 text-white/60 border-white/10"
                            >
                              {skillSlug}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Flow Visualization */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Workflow Flow</h3>
              <Card className="bg-card/30 border-white/5 p-6">
                <div className="flex flex-col gap-2">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            step.automated ? "bg-green-400" : "bg-yellow-400"
                          }`}
                        />
                        <span className="text-sm font-medium">{step.name}</span>
                      </div>
                      {index < workflow.steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-white/30" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span>Automated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span>Manual</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Required Skills */}
          <div className="space-y-6">
            <Card className="bg-card/30 border-white/5 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Required Skills</CardTitle>
                <CardDescription className="text-xs">
                  Install these skills to use this workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requiredSkillObjects.length > 0 ? (
                    requiredSkillObjects.map((skill) => (
                      <Link
                        key={skill.slug}
                        href={`/skills/${skill.slug}`}
                        className="block"
                      >
                        <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan/20 transition-all group">
                          <div className="font-medium text-sm group-hover:text-cyan transition-colors">
                            {skill.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {skill.description}
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-cyan group-hover:underline">
                            View skill
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="space-y-2">
                      {workflow.requiredSkills.map((slug) => (
                        <div
                          key={slug}
                          className="p-3 rounded-lg bg-white/5 border border-white/5"
                        >
                          <div className="font-medium text-sm text-white/60">
                            {slug}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Skill not yet available
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Separator className="my-4 opacity-10" />
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/skills">Browse Skills Directory</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
