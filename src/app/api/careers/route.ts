import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CAREERS_FILE_PATH = path.join(process.cwd(), "data", "careers.json");
type JobType = "full-time" | "part-time" | "contract" | "bounty";
type JobStatus = "open" | "closed";

type JobListing = {
  id: string;
  title: string;
  department: "engineering" | "design" | "community" | "operations";
  type: JobType;
  location: "remote" | "hybrid";
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: string;
  status: JobStatus;
};

type JobApplication = {
  id: string;
  roleId: string;
  roleTitle: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
};

type CareersData = {
  positions: JobListing[];
  applications: JobApplication[];
};

async function readCareersData(): Promise<CareersData> {
  const raw = await fs.readFile(CAREERS_FILE_PATH, "utf8");
  return JSON.parse(raw) as CareersData;
}

async function writeCareersData(data: CareersData) {
  await fs.writeFile(CAREERS_FILE_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function GET(request: NextRequest) {
  try {
    const data = await readCareersData();
    const { searchParams } = new URL(request.url);

    const department = searchParams.get("department")?.toLowerCase().trim();
    const type = searchParams.get("type")?.toLowerCase().trim();
    const status = searchParams.get("status")?.toLowerCase().trim();
    const search = searchParams.get("search")?.toLowerCase().trim();

    const filtered = data.positions.filter((job) => {
      const departmentMatches = department ? job.department.toLowerCase() === department : true;
      const typeMatches = type ? job.type === type : true;
      const statusMatches = status ? job.status === status : true;
      const searchMatches = search
        ? [job.title, job.description, job.department, ...job.requirements, ...job.benefits]
            .join(" ")
            .toLowerCase()
            .includes(search)
        : true;

      return departmentMatches && typeMatches && statusMatches && searchMatches;
    });

    return NextResponse.json({
      positions: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Failed to read careers data", error);
    return NextResponse.json({ error: "Failed to load careers data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      roleId?: string;
      name?: string;
      email?: string;
      message?: string;
    };

    const roleId = payload.roleId?.trim();
    const name = payload.name?.trim();
    const email = payload.email?.trim();
    const message = payload.message?.trim();

    if (!roleId || !name || !email || !message) {
      return NextResponse.json(
        { error: "roleId, name, email, and message are required" },
        { status: 400 },
      );
    }

    const data = await readCareersData();
    const matchedRole = data.positions.find((role) => role.id === roleId);

    if (!matchedRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const application: JobApplication = {
      id: `app_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
      roleId,
      roleTitle: matchedRole.title,
      name,
      email,
      message,
      submittedAt: new Date().toISOString(),
    };

    const updated: CareersData = {
      ...data,
      applications: [...(data.applications ?? []), application],
    };

    await writeCareersData(updated);

    return NextResponse.json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Failed to submit application", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
