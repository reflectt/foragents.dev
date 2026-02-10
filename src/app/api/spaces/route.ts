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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

export async function GET(request: NextRequest) {
  const visibility = request.nextUrl.searchParams.get("visibility")?.trim().toLowerCase() ?? "";
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
  const sort = request.nextUrl.searchParams.get("sort")?.trim().toLowerCase() ?? "newest";

  if (visibility && visibility !== "all" && !isVisibility(visibility)) {
    return NextResponse.json(
      {
        error: "Invalid visibility",
        allowed: ["public", "private", "unlisted", "all"],
      },
      { status: 400 }
    );
  }

  let spaces = await readSpaces();

  if (visibility && visibility !== "all") {
    spaces = spaces.filter((space) => space.visibility === visibility);
  }

  if (search) {
    spaces = spaces.filter((space) => {
      const haystack = `${space.name} ${space.description} ${space.tags.join(" ")} ${space.createdBy}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  const sortedSpaces = [...spaces].sort((a, b) => {
    if (sort === "members") {
      return b.memberCount - a.memberCount || b.createdAt.localeCompare(a.createdAt);
    }

    return b.createdAt.localeCompare(a.createdAt);
  });

  return NextResponse.json(
    {
      spaces: sortedSpaces,
      total: sortedSpaces.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: unknown;
      description?: unknown;
      visibility?: unknown;
      skillCount?: unknown;
      createdBy?: unknown;
      tags?: unknown;
      featured?: unknown;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const visibilityRaw = typeof body.visibility === "string" ? body.visibility.trim().toLowerCase() : "";
    const createdBy = typeof body.createdBy === "string" ? body.createdBy.trim() : "";
    const skillCount = typeof body.skillCount === "number" ? body.skillCount : Number(body.skillCount ?? 0);
    const featured = typeof body.featured === "boolean" ? body.featured : false;
    const tags = Array.isArray(body.tags)
      ? body.tags
          .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
          .map((tag) => tag.trim())
      : [];

    if (name.length < 3) {
      return NextResponse.json({ error: "Name must be at least 3 characters." }, { status: 400 });
    }

    if (description.length < 10) {
      return NextResponse.json({ error: "Description must be at least 10 characters." }, { status: 400 });
    }

    if (!isVisibility(visibilityRaw)) {
      return NextResponse.json({ error: "Visibility must be public, private, or unlisted." }, { status: 400 });
    }

    if (!createdBy) {
      return NextResponse.json({ error: "createdBy is required." }, { status: 400 });
    }

    if (!Number.isFinite(skillCount) || skillCount < 0) {
      return NextResponse.json({ error: "skillCount must be a non-negative number." }, { status: 400 });
    }

    const spaces = await readSpaces();
    const baseSlug = slugify(name);
    const slug = spaces.some((space) => space.slug === baseSlug)
      ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
      : baseSlug;

    const space: Space = {
      id: `space_${Date.now()}`,
      name,
      slug,
      description,
      visibility: visibilityRaw,
      memberCount: 1,
      skillCount,
      createdBy,
      createdAt: new Date().toISOString(),
      tags,
      featured,
    };

    const updated = [space, ...spaces];
    await writeSpaces(updated);

    return NextResponse.json(space, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
