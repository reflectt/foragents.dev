"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Terminal,
  Settings,
  History,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

// Import data
import skillsData from "@/data/skills.json";
import sandboxRunsData from "@/data/sandbox-runs.json";

// Types
interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
}

interface SandboxRun {
  id: string;
  skillId: string;
  skillName: string;
  timestamp: string;
  status: "success" | "error" | "running";
  model: string;
  temperature: number;
  timeout: number;
  output: string;
}

interface Config {
  model: string;
  temperature: number;
  timeout: number;
}

const models = [
  "claude-sonnet-4-5",
  "claude-opus-4-6",
  "claude-3-haiku",
  "gpt-4o",
  "gpt-4o-mini",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

export default function SandboxPage() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [config, setConfig] = useState<Config>({
    model: "claude-sonnet-4-5",
    temperature: 0.7,
    timeout: 30,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [currentOutput, setCurrentOutput] = useState("");
  const [executionHistory, setExecutionHistory] = useState<SandboxRun[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  // Load execution history on mount
  useEffect(() => {
    setExecutionHistory(sandboxRunsData.slice(0, 5) as SandboxRun[]);
  }, []);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [currentOutput]);

  const handleRun = async () => {
    if (!selectedSkill) return;

    setIsRunning(true);
    setCurrentOutput("");

    // Simulate streaming output
    const mockOutput = generateMockOutput(selectedSkill);
    const lines = mockOutput.split("\n");

    for (let i = 0; i < lines.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 100));
      setCurrentOutput((prev) => prev + lines[i] + "\n");
    }

    // Add to history
    const newRun: SandboxRun = {
      id: `run-${Date.now()}`,
      skillId: selectedSkill.id,
      skillName: selectedSkill.name,
      timestamp: new Date().toISOString(),
      status: Math.random() > 0.1 ? "success" : "error",
      model: config.model,
      temperature: config.temperature,
      timeout: config.timeout,
      output: mockOutput,
    };

    setExecutionHistory((prev) => [newRun, ...prev.slice(0, 4)]);
    setIsRunning(false);
  };

  const generateMockOutput = (skill: Skill): string => {
    const outputs: Record<string, string> = {
      "1": `Initializing ${skill.name}...\n\nSetting up memory layers:\n✓ Episodic memory (daily logs)\n✓ Semantic memory (knowledge base)\n✓ Procedural memory (how-to guides)\n\nCreating directory structure...\n✓ memory/\n✓ memory/daily/\n✓ memory/procedures/\n\nCopying templates...\n✓ MEMORY.md\n✓ memory/${new Date().toISOString().split('T')[0]}.md\n\n✅ Memory system initialized successfully!\n\nAgent can now:\n- Store daily experiences\n- Build long-term knowledge\n- Learn procedures from outcomes`,
      "8": `Connecting to Google Workspace...\n\n📧 Gmail API: Authenticating...\n✓ Connected (scope: gmail.readonly)\n✓ Unread messages: ${Math.floor(Math.random() * 50)}\n\n📅 Calendar API: Authenticating...\n✓ Connected (scope: calendar.readonly)\n✓ Today's events: ${Math.floor(Math.random() * 8)}\n\n📁 Drive API: Authenticating...\n✓ Connected (scope: drive.file)\n✓ Storage used: ${(Math.random() * 10).toFixed(1)} GB / 15 GB\n\n✅ All Google Workspace services operational!\n\nSkill is ready to:\n- Read and send emails\n- Manage calendar events\n- Access and organize files`,
      "9": `Launching coding agent subprocess...\n\n🔧 Environment check:\n✓ Node.js v25.5.0\n✓ TypeScript 5.6.3\n✓ Git 2.47.1\n\n🤖 Spawning coding agent:\n✓ Agent model: ${config.model}\n✓ Temperature: ${config.temperature}\n✓ Max timeout: ${config.timeout}s\n\n📝 Agent capabilities:\n- Code generation\n- Bug fixing\n- Refactoring\n- Test writing\n\n✅ Coding agent ready!\n\nType your coding task to begin...`,
      "10": `Fetching weather data...\n\n🌍 Location: Auto-detected (San Francisco, CA)\n\n⛅ Current Conditions:\n   Temperature: ${Math.floor(Math.random() * 30 + 50)}°F\n   Conditions: ${["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][Math.floor(Math.random() * 4)]}\n   Humidity: ${Math.floor(Math.random() * 40 + 40)}%\n   Wind: ${Math.floor(Math.random() * 15 + 5)} mph\n\n📅 5-Day Forecast:\n   Mon: ⛅ 62°F / 52°F\n   Tue: 🌧️  59°F / 50°F\n   Wed: ☁️  61°F / 51°F\n   Thu: ☀️  65°F / 53°F\n   Fri: ☀️  67°F / 54°F\n\n✅ Weather data retrieved successfully!`,
    };

    return (
      outputs[skill.id] ||
      `Executing ${skill.name}...\n\n✓ Skill loaded\n✓ Dependencies verified\n✓ Configuration applied\n\nRunning skill with:\n- Model: ${config.model}\n- Temperature: ${config.temperature}\n- Timeout: ${config.timeout}s\n\n${skill.description}\n\n✅ Skill execution completed successfully!\n\nInstall command:\n${skill.install_cmd}`
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const skills = skillsData as Skill[];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Agent Skill Sandbox</h1>
        <p className="text-muted-foreground text-lg">
          Test skills in a safe environment before installing them
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Skill Selector */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Skill</CardTitle>
              <CardDescription>Choose a skill to test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedSkill?.id}
                onValueChange={(id) => {
                  const skill = skills.find((s) => s.id === id);
                  setSelectedSkill(skill || null);
                  setCurrentOutput("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSkill && (
                <div className="space-y-3 pt-2">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">
                      {selectedSkill.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedSkill.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Author: {selectedSkill.author}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {selectedSkill.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-medium">Install Command:</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {selectedSkill.install_cmd}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Terminal Output */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  <CardTitle className="text-lg">Execution Output</CardTitle>
                </div>
                <Button
                  onClick={handleRun}
                  disabled={!selectedSkill || isRunning}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isRunning ? "Running..." : "Run"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div
                ref={outputRef}
                className="flex-1 bg-black text-green-400 font-mono text-sm p-4 rounded-lg overflow-auto min-h-[400px] max-h-[500px]"
              >
                {currentOutput || (
                  <span className="text-gray-600">
                    Select a skill and click Run to see output...
                  </span>
                )}
                {isRunning && <span className="animate-pulse">▋</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Configuration */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle className="text-lg">Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={config.model}
                  onValueChange={(value) =>
                    setConfig({ ...config, model: value })
                  }
                >
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature: {config.temperature}
                </Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout: {config.timeout}s</Label>
                <input
                  id="timeout"
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={config.timeout}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      timeout: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>15s</span>
                  <span>120s</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">About</p>
                <p className="text-xs text-muted-foreground">
                  This sandbox provides a safe environment to test skills with
                  different configurations before installing them in your agent.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Execution History */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <CardTitle className="text-lg">Execution History</CardTitle>
            </div>
            <CardDescription>Last 5 skill execution runs</CardDescription>
          </CardHeader>
          <CardContent>
            {executionHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No execution history yet. Run a skill to see it here.
              </p>
            ) : (
              <div className="space-y-2">
                {executionHistory.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">
                        {run.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : run.status === "error" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{run.skillName}</p>
                          <Badge
                            variant={
                              run.status === "success" ? "default" : "destructive"
                            }
                            className="text-xs"
                          >
                            {run.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{run.model}</span>
                          <span>•</span>
                          <span>temp: {run.temperature}</span>
                          <span>•</span>
                          <span>{run.timeout}s timeout</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {formatTimestamp(run.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
