import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

interface DiagnosticProfile {
  id: string;
  agentHandle: string;
  duration: number;
  tokenUsage: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  memoryPeak: number;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "diagnostic-profiles.json");

const readProfiles = async (): Promise<DiagnosticProfile[]> => {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as DiagnosticProfile[];
  return Array.isArray(parsed) ? parsed : [];
};

const writeProfiles = async (profiles: DiagnosticProfile[]) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(profiles, null, 2), "utf8");
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentHandle = searchParams.get("agentHandle")?.toLowerCase().trim();
    const search = searchParams.get("search")?.toLowerCase().trim();
    const minDuration = Number(searchParams.get("minDuration") ?? "0");
    const maxDuration = Number(searchParams.get("maxDuration") ?? Number.MAX_SAFE_INTEGER.toString());

    const profiles = await readProfiles();

    const filtered = profiles.filter((item) => {
      const matchesAgent = !agentHandle || agentHandle === "all" || item.agentHandle.toLowerCase() === agentHandle;
      const matchesSearch =
        !search ||
        item.id.toLowerCase().includes(search) ||
        item.agentHandle.toLowerCase().includes(search);
      const matchesDuration = item.duration >= minDuration && item.duration <= maxDuration;

      return matchesAgent && matchesSearch && matchesDuration;
    });

    return NextResponse.json({
      profiles: filtered,
      count: filtered.length,
      total: profiles.length,
    });
  } catch (error) {
    console.error("Failed to load diagnostic profiles", error);
    return NextResponse.json({ error: "Failed to load diagnostic profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DiagnosticProfile>;

    const agentHandle = typeof body.agentHandle === "string" ? body.agentHandle.trim().toLowerCase() : "";

    if (!agentHandle) {
      return NextResponse.json({ error: "agentHandle is required" }, { status: 400 });
    }

    const numericFields: Array<keyof Pick<DiagnosticProfile, "duration" | "tokenUsage" | "latencyP50" | "latencyP95" | "latencyP99" | "memoryPeak">> = [
      "duration",
      "tokenUsage",
      "latencyP50",
      "latencyP95",
      "latencyP99",
      "memoryPeak",
    ];

    for (const field of numericFields) {
      if (typeof body[field] !== "number" || body[field]! < 0) {
        return NextResponse.json(
          { error: `${field} is required and must be a non-negative number` },
          { status: 400 }
        );
      }
    }

    const profiles = await readProfiles();

    const nextProfile: DiagnosticProfile = {
      id: body.id?.trim() || `prof_${crypto.randomUUID()}`,
      agentHandle,
      duration: body.duration!,
      tokenUsage: body.tokenUsage!,
      latencyP50: body.latencyP50!,
      latencyP95: body.latencyP95!,
      latencyP99: body.latencyP99!,
      memoryPeak: body.memoryPeak!,
      createdAt: body.createdAt?.trim() || new Date().toISOString(),
    };

    profiles.unshift(nextProfile);
    await writeProfiles(profiles);

    return NextResponse.json({ profile: nextProfile }, { status: 201 });
  } catch (error) {
    console.error("Failed to create diagnostic profile", error);
    return NextResponse.json({ error: "Failed to create diagnostic profile" }, { status: 500 });
  }
}
