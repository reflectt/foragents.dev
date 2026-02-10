import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type PlaygroundRunStatus = "success" | "error";

type PlaygroundRun = {
  id: string;
  agentHandle: string;
  prompt: string;
  response: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  status: PlaygroundRunStatus;
  createdAt: string;
};

type CreateRunPayload = {
  agentHandle?: unknown;
  prompt?: unknown;
  model?: unknown;
};

const RUNS_PATH = path.join(process.cwd(), "data", "playground-runs.json");
const MAX_RUNS = 100;

async function readRuns(): Promise<PlaygroundRun[]> {
  try {
    const raw = await fs.readFile(RUNS_PATH, "utf-8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];
    return parsed as PlaygroundRun[];
  } catch {
    return [];
  }
}

async function writeRuns(runs: PlaygroundRun[]): Promise<void> {
  const dir = path.dirname(RUNS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(RUNS_PATH, `${JSON.stringify(runs, null, 2)}\n`, "utf-8");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockResponse(prompt: string, agentHandle: string, model: string, status: PlaygroundRunStatus): string {
  if (status === "error") {
    return `Run failed for ${agentHandle} on ${model}: upstream provider timeout while processing prompt segment \"${prompt.slice(0, 80)}${prompt.length > 80 ? "..." : ""}\".`;
  }

  return `Simulated response for ${agentHandle} using ${model}:\n\nProcessed prompt: \"${prompt.slice(0, 240)}${prompt.length > 240 ? "..." : ""}\"\n\nResult: Prompt completed successfully with coherent output and stable tool calls.`;
}

export async function GET(request: NextRequest) {
  const agent = request.nextUrl.searchParams.get("agent")?.trim().toLowerCase();
  const runs = await readRuns();

  const filtered = agent
    ? runs.filter((run) => run.agentHandle.toLowerCase() === agent)
    : runs;

  const ordered = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(
    {
      runs: ordered,
      total: runs.length,
      filteredCount: ordered.length,
      agent: agent ?? null,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  let payload: CreateRunPayload;

  try {
    payload = (await request.json()) as CreateRunPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const agentHandle = typeof payload.agentHandle === "string" ? payload.agentHandle.trim() : "";
  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  const model = typeof payload.model === "string" && payload.model.trim().length > 0 ? payload.model.trim() : "claude-3.5-sonnet";

  if (!agentHandle || !prompt) {
    return NextResponse.json(
      { error: "agentHandle and prompt are required" },
      { status: 400 }
    );
  }

  const latencyMs = 450 + Math.floor(Math.random() * 1800);
  const tokensUsed = Math.max(120, Math.round(prompt.length * 1.35) + Math.floor(Math.random() * 220));
  const isError = /error|fail|timeout|degraded/i.test(prompt) || Math.random() < 0.18;
  const status: PlaygroundRunStatus = isError ? "error" : "success";
  const response = generateMockResponse(prompt, agentHandle, model, status);

  await sleep(Math.min(latencyMs, 1800));

  const newRun: PlaygroundRun = {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agentHandle,
    prompt,
    response,
    model,
    tokensUsed,
    latencyMs,
    status,
    createdAt: new Date().toISOString(),
  };

  const existingRuns = await readRuns();
  const updatedRuns = [newRun, ...existingRuns].slice(0, MAX_RUNS);
  await writeRuns(updatedRuns);

  return NextResponse.json(
    {
      run: newRun,
      message: status === "success" ? "Run completed" : "Run failed",
    },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
