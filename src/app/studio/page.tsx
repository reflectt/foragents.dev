"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import templates from "@/data/studio-templates.json";

type Parameter = {
  name: string;
  type: string;
  description: string;
  default: string | number;
};

type EnvVar = {
  name: string;
  description: string;
  required: boolean;
};

type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  parameters: Parameter[];
  dependencies: string[];
  envVars: EnvVar[];
  sampleInput: string;
  sampleOutput: string;
  validation: string;
  skillTemplate: string;
};

type SkillData = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  install_cmd: string;
  repo_url: string;
  parameters: Parameter[];
  dependencies: string[];
  envVars: EnvVar[];
  sampleInput: string;
  sampleOutput: string;
  validation: string;
};

const CATEGORIES = [
  "Core Systems",
  "Integration",
  "Utilities",
  "Communication",
  "Automation",
  "Observability",
  "Security",
  "Data",
];

export default function StudioPage() {
  const [step, setStep] = useState(0); // 0 = template picker, 1-4 = wizard steps
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [skillData, setSkillData] = useState<SkillData>({
    name: "",
    description: "",
    category: "Core Systems",
    tags: [],
    author: "Team Reflectt",
    install_cmd: "",
    repo_url: "",
    parameters: [],
    dependencies: [],
    envVars: [],
    sampleInput: "",
    sampleOutput: "",
    validation: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [parameterInput, setParameterInput] = useState<Parameter>({
    name: "",
    type: "string",
    description: "",
    default: "",
  });
  const [envVarInput, setEnvVarInput] = useState<EnvVar>({
    name: "",
    description: "",
    required: false,
  });
  const [dependencyInput, setDependencyInput] = useState("");
  const [generatedSkillMd, setGeneratedSkillMd] = useState("");

  // Generate SKILL.md preview whenever data changes
  useEffect(() => {
    if (step > 0) {
      generateSkillMd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillData, step]);

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setSkillData({
      ...skillData,
      name: template.name,
      description: template.description,
      category: template.category,
      tags: [...template.tags],
      parameters: [...template.parameters],
      dependencies: [...template.dependencies],
      envVars: [...template.envVars],
      sampleInput: template.sampleInput,
      sampleOutput: template.sampleOutput,
      validation: template.validation,
    });
    setStep(1);
  };

  const startFromScratch = () => {
    setSelectedTemplate(null);
    setStep(1);
  };

  const generateSkillMd = () => {
    let md = `# ${skillData.name}\n\n${skillData.description}\n\n`;

    md += `## Category\n\n${skillData.category}\n\n`;

    if (skillData.tags.length > 0) {
      md += `## Tags\n\n${skillData.tags.map(tag => `\`${tag}\``).join(", ")}\n\n`;
    }

    md += `## Installation\n\n\`\`\`bash\n${skillData.install_cmd || "# Add your installation command"}\n\`\`\`\n\n`;

    if (skillData.repo_url) {
      md += `## Repository\n\n${skillData.repo_url}\n\n`;
    }

    if (skillData.parameters.length > 0) {
      md += `## Parameters\n\n`;
      skillData.parameters.forEach(param => {
        md += `### ${param.name}\n\n`;
        md += `- **Type**: ${param.type}\n`;
        md += `- **Description**: ${param.description}\n`;
        md += `- **Default**: \`${param.default}\`\n\n`;
      });
    }

    if (skillData.dependencies.length > 0) {
      md += `## Dependencies\n\n${skillData.dependencies.map(dep => `- ${dep}`).join("\n")}\n\n`;
    }

    if (skillData.envVars.length > 0) {
      md += `## Environment Variables\n\n`;
      skillData.envVars.forEach(env => {
        md += `### ${env.name}\n\n`;
        md += `- **Description**: ${env.description}\n`;
        md += `- **Required**: ${env.required ? "Yes" : "No"}\n\n`;
      });
    }

    if (skillData.sampleInput || skillData.sampleOutput) {
      md += `## Testing\n\n`;
      if (skillData.sampleInput) {
        md += `### Sample Input\n\n\`\`\`\n${skillData.sampleInput}\n\`\`\`\n\n`;
      }
      if (skillData.sampleOutput) {
        md += `### Sample Output\n\n\`\`\`\n${skillData.sampleOutput}\n\`\`\`\n\n`;
      }
      if (skillData.validation) {
        md += `### Validation\n\n${skillData.validation}\n\n`;
      }
    }

    md += `## Author\n\n${skillData.author}\n`;

    setGeneratedSkillMd(md);
  };

  const generateAgentJson = () => {
    return JSON.stringify({
      name: skillData.name,
      description: skillData.description,
      category: skillData.category,
      tags: skillData.tags,
      author: skillData.author,
      install_cmd: skillData.install_cmd,
      repo_url: skillData.repo_url,
    }, null, 2);
  };

  const addTag = () => {
    if (tagInput && !skillData.tags.includes(tagInput)) {
      setSkillData({ ...skillData, tags: [...skillData.tags, tagInput] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setSkillData({ ...skillData, tags: skillData.tags.filter(t => t !== tag) });
  };

  const addParameter = () => {
    if (parameterInput.name) {
      setSkillData({ 
        ...skillData, 
        parameters: [...skillData.parameters, { ...parameterInput }] 
      });
      setParameterInput({ name: "", type: "string", description: "", default: "" });
    }
  };

  const removeParameter = (index: number) => {
    setSkillData({ 
      ...skillData, 
      parameters: skillData.parameters.filter((_, i) => i !== index) 
    });
  };

  const addEnvVar = () => {
    if (envVarInput.name) {
      setSkillData({ 
        ...skillData, 
        envVars: [...skillData.envVars, { ...envVarInput }] 
      });
      setEnvVarInput({ name: "", description: "", required: false });
    }
  };

  const removeEnvVar = (index: number) => {
    setSkillData({ 
      ...skillData, 
      envVars: skillData.envVars.filter((_, i) => i !== index) 
    });
  };

  const addDependency = () => {
    if (dependencyInput && !skillData.dependencies.includes(dependencyInput)) {
      setSkillData({ 
        ...skillData, 
        dependencies: [...skillData.dependencies, dependencyInput] 
      });
      setDependencyInput("");
    }
  };

  const removeDependency = (dep: string) => {
    setSkillData({ 
      ...skillData, 
      dependencies: skillData.dependencies.filter(d => d !== dep) 
    });
  };

  const downloadSkill = () => {
    const blob = new Blob([generatedSkillMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSkillMd);
    alert("Copied to clipboard!");
  };

  const progressPercentage = step === 0 ? 0 : ((step - 1) / 4) * 100;

  // Template Picker (Step 0)
  if (step === 0) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-cyan mb-4">
              Skill Authoring Studio
            </h1>
            <p className="text-muted-foreground text-lg">
              Create production-ready agent skills in minutes
            </p>
          </div>

          <div className="mb-8">
            <Button 
              onClick={startFromScratch}
              className="w-full bg-cyan hover:bg-cyan/90 text-background font-semibold"
              size="lg"
            >
              Start from Scratch
            </Button>
          </div>

          <Separator className="my-8" />

          <h2 className="text-2xl font-bold mb-6">Or choose a template</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:border-cyan transition-all"
                onClick={() => selectTemplate(template as Template)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{template.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Wizard Steps
  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-cyan">Skill Authoring Studio</h1>
            <span className="text-sm text-muted-foreground">
              Step {step} of 4
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-cyan h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div>
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Basic Information</CardTitle>
                  <CardDescription>
                    Define your skill's identity and purpose
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Skill Name</Label>
                    <Input
                      id="name"
                      value={skillData.name}
                      onChange={(e) => setSkillData({ ...skillData, name: e.target.value })}
                      placeholder="Agent Memory Kit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={skillData.description}
                      onChange={(e) => setSkillData({ ...skillData, description: e.target.value })}
                      placeholder="A brief description of what your skill does..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={skillData.category}
                      onChange={(e) => setSkillData({ ...skillData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={skillData.author}
                      onChange={(e) => setSkillData({ ...skillData, author: e.target.value })}
                      placeholder="Team Reflectt"
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        placeholder="Add a tag..."
                      />
                      <Button onClick={addTag} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillData.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="install_cmd">Installation Command</Label>
                    <Input
                      id="install_cmd"
                      value={skillData.install_cmd}
                      onChange={(e) => setSkillData({ ...skillData, install_cmd: e.target.value })}
                      placeholder="git clone https://github.com/..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="repo_url">Repository URL</Label>
                    <Input
                      id="repo_url"
                      value={skillData.repo_url}
                      onChange={(e) => setSkillData({ ...skillData, repo_url: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Configuration</CardTitle>
                  <CardDescription>
                    Define parameters, environment variables, and dependencies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Parameters */}
                  <div>
                    <h3 className="font-semibold mb-3">Parameters</h3>
                    <div className="space-y-2 mb-3">
                      <Input
                        placeholder="Parameter name"
                        value={parameterInput.name}
                        onChange={(e) => setParameterInput({ ...parameterInput, name: e.target.value })}
                      />
                      <select
                        value={parameterInput.type}
                        onChange={(e) => setParameterInput({ ...parameterInput, type: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                      </select>
                      <Input
                        placeholder="Description"
                        value={parameterInput.description}
                        onChange={(e) => setParameterInput({ ...parameterInput, description: e.target.value })}
                      />
                      <Input
                        placeholder="Default value"
                        value={parameterInput.default}
                        onChange={(e) => setParameterInput({ ...parameterInput, default: e.target.value })}
                      />
                      <Button onClick={addParameter} variant="secondary" className="w-full">
                        Add Parameter
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {skillData.parameters.map((param, idx) => (
                        <div key={idx} className="p-3 bg-secondary rounded-md flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{param.name}</div>
                            <div className="text-sm text-muted-foreground">{param.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {param.type} · default: {param.default}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeParameter(idx)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Environment Variables */}
                  <div>
                    <h3 className="font-semibold mb-3">Environment Variables</h3>
                    <div className="space-y-2 mb-3">
                      <Input
                        placeholder="Variable name (e.g., API_KEY)"
                        value={envVarInput.name}
                        onChange={(e) => setEnvVarInput({ ...envVarInput, name: e.target.value })}
                      />
                      <Input
                        placeholder="Description"
                        value={envVarInput.description}
                        onChange={(e) => setEnvVarInput({ ...envVarInput, description: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="required"
                          checked={envVarInput.required}
                          onCheckedChange={(checked) => 
                            setEnvVarInput({ ...envVarInput, required: checked as boolean })
                          }
                        />
                        <Label htmlFor="required">Required</Label>
                      </div>
                      <Button onClick={addEnvVar} variant="secondary" className="w-full">
                        Add Environment Variable
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {skillData.envVars.map((env, idx) => (
                        <div key={idx} className="p-3 bg-secondary rounded-md flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{env.name}</div>
                            <div className="text-sm text-muted-foreground">{env.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {env.required ? "Required" : "Optional"}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeEnvVar(idx)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Dependencies */}
                  <div>
                    <h3 className="font-semibold mb-3">Dependencies</h3>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="e.g., curl, jq, python"
                        value={dependencyInput}
                        onChange={(e) => setDependencyInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDependency())}
                      />
                      <Button onClick={addDependency} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillData.dependencies.map(dep => (
                        <Badge 
                          key={dep} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeDependency(dep)}
                        >
                          {dep} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Testing</CardTitle>
                  <CardDescription>
                    Define sample inputs/outputs and validation rules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sampleInput">Sample Input</Label>
                    <Textarea
                      id="sampleInput"
                      value={skillData.sampleInput}
                      onChange={(e) => setSkillData({ ...skillData, sampleInput: e.target.value })}
                      placeholder="Example input for your skill..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sampleOutput">Sample Output</Label>
                    <Textarea
                      id="sampleOutput"
                      value={skillData.sampleOutput}
                      onChange={(e) => setSkillData({ ...skillData, sampleOutput: e.target.value })}
                      placeholder="Expected output..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="validation">Validation Rules</Label>
                    <Textarea
                      id="validation"
                      value={skillData.validation}
                      onChange={(e) => setSkillData({ ...skillData, validation: e.target.value })}
                      placeholder="How to validate that your skill works correctly..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 4: Preview & Export</CardTitle>
                  <CardDescription>
                    Your skill is ready! Download or publish it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-secondary p-4 rounded-md">
                    <h3 className="font-semibold mb-2">agent.json snippet</h3>
                    <pre className="text-xs overflow-x-auto">
                      <code>{generateAgentJson()}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={downloadSkill}
                      className="w-full bg-cyan hover:bg-cyan/90 text-background"
                    >
                      Download SKILL.md
                    </Button>
                    <Button 
                      onClick={copyToClipboard}
                      variant="secondary"
                      className="w-full"
                    >
                      Copy to Clipboard
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open("https://foragents.dev/submit", "_blank")}
                    >
                      Publish to forAgents.dev
                    </Button>
                  </div>

                  <Separator />

                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      💡 <strong>Next steps:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Test your skill with real agents</li>
                      <li>Add it to your skill registry</li>
                      <li>Share it with the community</li>
                      <li>Gather feedback and iterate</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-6">
              {step > 1 && (
                <Button 
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1"
                >
                  ← Previous
                </Button>
              )}
              {step < 4 && (
                <Button 
                  onClick={() => setStep(step + 1)}
                  className="flex-1 bg-cyan hover:bg-cyan/90 text-background"
                >
                  Next →
                </Button>
              )}
              {step === 4 && (
                <Button 
                  onClick={() => setStep(0)}
                  variant="outline"
                  className="flex-1"
                >
                  Start New Skill
                </Button>
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card className="max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle className="text-cyan">Live Preview</CardTitle>
                <CardDescription>SKILL.md</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-xs bg-background p-4 rounded-md border border-border">
                    {generatedSkillMd || "Fill in the form to see your SKILL.md preview..."}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
