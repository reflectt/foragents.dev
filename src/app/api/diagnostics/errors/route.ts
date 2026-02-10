import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

type ErrorSeverity = "low" | "medium" | "high" | "critical";
type ErrorStatus = "open" | "investigating" | "resolved";

interface DiagnosticError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  source: string;
  stackTrace: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  status: ErrorStatus;
}

const DATA_FILE = path.join(process.cwd(), "data", "diagnostic-errors.json");

const VALID_SEVERITIES: ErrorSeverity[] = ["low", "medium", "high", "critical"];
const VALID_STATUSES: ErrorStatus[] = ["open", "investigating", "resolved"];

const readErrors = async (): Promise<DiagnosticError[]> => {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as DiagnosticError[];
  return Array.isArray(parsed) ? parsed : [];
};

const writeErrors = async (errors: DiagnosticError[]) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(errors, null, 2), "utf8");
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity")?.toLowerCase();
    const status = searchParams.get("status")?.toLowerCase();
    const source = searchParams.get("source")?.toLowerCase();
    const search = searchParams.get("search")?.toLowerCase().trim();

    const errors = await readErrors();

    const filtered = errors.filter((item) => {
      const matchesSeverity = !severity || severity === "all" || item.severity === severity;
      const matchesStatus = !status || status === "all" || item.status === status;
      const matchesSource = !source || source === "all" || item.source.toLowerCase().includes(source);
      const matchesSearch =
        !search ||
        item.id.toLowerCase().includes(search) ||
        item.message.toLowerCase().includes(search) ||
        item.source.toLowerCase().includes(search) ||
        item.stackTrace.toLowerCase().includes(search);

      return matchesSeverity && matchesStatus && matchesSource && matchesSearch;
    });

    return NextResponse.json({
      errors: filtered,
      count: filtered.length,
      total: errors.length,
    });
  } catch (error) {
    console.error("Failed to load diagnostic errors", error);
    return NextResponse.json({ error: "Failed to load diagnostic errors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DiagnosticError>;

    const message = typeof body.message === "string" ? body.message.trim() : "";
    const source = typeof body.source === "string" ? body.source.trim() : "";
    const stackTrace = typeof body.stackTrace === "string" ? body.stackTrace.trim() : "";
    const severity = body.severity;
    const status = body.status;

    if (!message || !source || !stackTrace || !severity || !status) {
      return NextResponse.json(
        { error: "message, source, stackTrace, severity, and status are required" },
        { status: 400 }
      );
    }

    if (!VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json(
        { error: `severity must be one of: ${VALID_SEVERITIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const errors = await readErrors();

    const nextError: DiagnosticError = {
      id: body.id?.trim() || `err_${crypto.randomUUID()}`,
      message,
      severity,
      source,
      stackTrace,
      count: typeof body.count === "number" && body.count >= 1 ? body.count : 1,
      firstSeen: body.firstSeen?.trim() || now,
      lastSeen: body.lastSeen?.trim() || now,
      status,
    };

    errors.unshift(nextError);
    await writeErrors(errors);

    return NextResponse.json({ errorEntry: nextError }, { status: 201 });
  } catch (error) {
    console.error("Failed to create diagnostic error", error);
    return NextResponse.json({ error: "Failed to create diagnostic error" }, { status: 500 });
  }
}
