import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type SpaceVisibility = "public" | "private" | "unlisted";

type Space = {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: SpaceVisibility;
  memberCount: number;
  skillCount: number;
  createdBy: string;
  createdAt: string;
  tags: string[];
  featured: boolean;
};

const SPACES_PATH = path.join(process.cwd(), "data", "spaces.json");

function isVisibility(value: string): value is SpaceVisibility {
  return value === "public" || value === "private" || value === "unlisted";
}

function normalizeSpaces(data: unknown): Space[] {
  if (!Array.isArray(data)) return [];

  return data.filter(
    (space): space is Space =>
      typeof space?.id === "string" &&
      typeof space?.name === "string" &&
      typeof space?.slug === "string" &&
      typeof space?.description === "string" &&
      typeof space?.visibility === "string" &&
      isVisibility(space.visibility) &&
      typeof space?.memberCount === "number" &&
      typeof space?.skillCount === "number" &&
      typeof space?.createdBy === "string" &&
      typeof space?.createdAt === "string" &&
      Array.isArray(space?.tags) &&
      space.tags.every((tag: unknown) => typeof tag === "string") &&
      typeof space?.featured === "boolean"
  );
}

async function readSpaces(): Promise<Space[]> {
  try {
    const raw = await fs.readFile(SPACES_PATH, "utf8");
    return normalizeSpaces(JSON.parse(raw));
  } catch {
    return [];
  }
}

async function writeSpaces(spaces: Space[]) {
  await fs.writeFile(SPACES_PATH, JSON.stringify(spaces, null, 2));
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const targetSlug = typeof slug === "string" ? slug.trim() : "";

  if (!targetSlug) {
    return NextResponse.json({ error: "Space slug is required." }, { status: 400 });
  }

  const spaces = await readSpaces();
  const space = spaces.find((item) => item.slug === targetSlug);

  if (!space) {
    return NextResponse.json({ error: "Space not found." }, { status: 404 });
  }

  return NextResponse.json({ space }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const targetSlug = typeof slug === "string" ? slug.trim() : "";

  if (!targetSlug) {
    return NextResponse.json({ error: "Space slug is required." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  const action = typeof body?.action === "string" ? body.action.trim().toLowerCase() : "join";

  if (action !== "join" && action !== "leave") {
    return NextResponse.json({ error: "action must be join or leave." }, { status: 400 });
  }

  const spaces = await readSpaces();
  const index = spaces.findIndex((item) => item.slug === targetSlug);

  if (index === -1) {
    return NextResponse.json({ error: "Space not found." }, { status: 404 });
  }

  const existing = spaces[index];
  const memberCount = action === "join" ? existing.memberCount + 1 : Math.max(0, existing.memberCount - 1);

  const updatedSpace: Space = {
    ...existing,
    memberCount,
  };

  spaces[index] = updatedSpace;
  await writeSpaces(spaces);

  return NextResponse.json({
    success: true,
    action,
    space: updatedSpace,
  });
}
