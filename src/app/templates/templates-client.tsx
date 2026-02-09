"use client";

import { useState, useMemo } from "react";
import type { Template, TemplateCategory, TemplateDifficulty } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Code2, Layers } from "lucide-react";

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

const categoryInfo: Record<TemplateCategory, { emoji: string; label: string }> = {
  starter: { emoji: "🚀", label: "Starter" },
  integration: { emoji: "🔌", label: "Integration" },
  data: { emoji: "📊", label: "Data" },
  communication: { emoji: "💬", label: "Communication" },
  utility: { emoji: "🛠️", label: "Utility" },
  security: { emoji: "🔒", label: "Security" },
};

export function TemplatesClient({ templates }: { templates: Template[] }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<TemplateDifficulty | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesDifficulty = selectedDifficulty === "all" || template.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesDifficulty && matchesCategory;
    });
  }, [templates, selectedDifficulty, selectedCategory]);

  const difficulties: Array<TemplateDifficulty | "all"> = ["all", "beginner", "intermediate", "advanced"];
  const categories: Array<TemplateCategory | "all"> = ["all", "starter", "integration", "data", "communication", "utility", "security"];

  return (
    <>
      {/* Filters */}
      <section className="border-b border-white/5 bg-card/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* Difficulty Filter */}
            <div>
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    size="sm"
                    className={selectedDifficulty === difficulty ? "bg-cyan hover:bg-cyan/90" : ""}
                  >
                    {difficulty === "all" ? "All" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className={selectedCategory === category ? "bg-cyan hover:bg-cyan/90" : ""}
                  >
                    {category === "all" ? "All" : (
                      <>
                        {categoryInfo[category as TemplateCategory]?.emoji}{" "}
                        {categoryInfo[category as TemplateCategory]?.label}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No templates found matching your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="border-white/5 bg-card/40 hover:border-cyan/20 transition-all group flex flex-col"
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                        {template.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${difficultyColors[template.difficulty]}`}
                      >
                        {template.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {template.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{template.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{template.language}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{template.framework}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-auto">
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`/templates/${template.id}`}>
                        View Template →
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
