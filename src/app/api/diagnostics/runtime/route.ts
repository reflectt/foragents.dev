import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

type RuntimeStatus = "healthy" | "warning" | "critical";

interface DiagnosticRuntimeSnapshot {
  id: string;
  agentHandle: string;
  uptime: number;
  requestCount: number;
  errorRate: number;
  avgLatency: number;
  status: RuntimeStatus;
  checkedAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "diagnostic-runtime.json");
const VALID_STATUSES: RuntimeStatus[] = ["healthy", "warning", "critical"];

const readRuntime = async (): Promise<DiagnosticRuntimeSnapshot[]> => {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as DiagnosticRuntimeSnapshot[];
  return Array.isArray(parsed) ? parsed : [];
};

const writeRuntime = async (snapshots: DiagnosticRuntimeSnapshot[]) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(snapshots, null, 2), "utf8");
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toLowerCase();
    const agentHandle = searchParams.get("agentHandle")?.toLowerCase().trim();
    const search = searchParams.get("search")?.toLowerCase().trim();
    const minErrorRate = Number(searchParams.get("minErrorRate") ?? "0");
    const maxErrorRate = Number(searchParams.get("maxErrorRate") ?? "100");

    const snapshots = await readRuntime();

    const filtered = snapshots.filter((item) => {
      const matchesStatus = !status || status === "all" || item.status === status;
      const matchesAgent = !agentHandle || agentHandle === "all" || item.agentHandle.toLowerCase() === agentHandle;
      const matchesSearch =
        !search ||
        item.id.toLowerCase().includes(search) ||
        item.agentHandle.toLowerCase().includes(search);
      const matchesErrorRate = item.errorRate >= minErrorRate && item.errorRate <= maxErrorRate;

      return matchesStatus && matchesAgent && matchesSearch && matchesErrorRate;
    });

    return NextResponse.json({
      snapshots: filtered,
      count: filtered.length,
      total: snapshots.length,
    });
  } catch (error) {
    console.error("Failed to load runtime diagnostics", error);
    return NextResponse.json({ error: "Failed to load runtime diagnostics" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DiagnosticRuntimeSnapshot>;
    const agentHandle = typeof body.agentHandle === "string" ? body.agentHandle.trim().toLowerCase() : "";
    const status = body.status;

    if (!agentHandle || !status) {
      return NextResponse.json({ error: "agentHandle and status are required" }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const numericFields: Array<keyof Pick<DiagnosticRuntimeSnapshot, "uptime" | "requestCount" | "errorRate" | "avgLatency">> = [
      "uptime",
      "requestCount",
      "errorRate",
      "avgLatency",
    ];

    for (const field of numericFields) {
      if (typeof body[field] !== "number" || body[field]! < 0) {
        return NextResponse.json(
          { error: `${field} is required and must be a non-negative number` },
          { status: 400 }
        );
      }
    }

    const snapshots = await readRuntime();

    const nextSnapshot: DiagnosticRuntimeSnapshot = {
      id: body.id?.trim() || `run_${crypto.randomUUID()}`,
      agentHandle,
      uptime: body.uptime!,
      requestCount: body.requestCount!,
      errorRate: body.errorRate!,
      avgLatency: body.avgLatency!,
      status,
      checkedAt: body.checkedAt?.trim() || new Date().toISOString(),
    };

    snapshots.unshift(nextSnapshot);
    await writeRuntime(snapshots);

    return NextResponse.json({ snapshot: nextSnapshot }, { status: 201 });
  } catch (error) {
    console.error("Failed to create runtime diagnostics", error);
    return NextResponse.json({ error: "Failed to create runtime diagnostics" }, { status: 500 });
  }
}
