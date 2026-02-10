import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type BookmarkItemType = "skill" | "mcp" | "guide" | "bounty";

type BookmarkRecord = {
  id: string;
  agentHandle: string;
  itemId: string;
  itemType: BookmarkItemType;
  itemTitle: string;
  itemUrl: string;
  createdAt: string;
};

type CreateBookmarkBody = {
  agentHandle?: unknown;
  itemId?: unknown;
  itemType?: unknown;
  itemTitle?: unknown;
  itemUrl?: unknown;
};

const BOOKMARKS_PATH = path.join(process.cwd(), "data", "bookmarks.json");
const VALID_TYPES: BookmarkItemType[] = ["skill", "mcp", "guide", "bounty"];

async function readBookmarks(): Promise<BookmarkRecord[]> {
  try {
    const raw = await fs.readFile(BOOKMARKS_PATH, "utf8");
    const parsed = JSON.parse(raw) as BookmarkRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeBookmarks(bookmarks: BookmarkRecord[]): Promise<void> {
  const dir = path.dirname(BOOKMARKS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(BOOKMARKS_PATH, JSON.stringify(bookmarks, null, 2), "utf8");
}

export async function GET(request: NextRequest) {
  try {
    const typeFilter = request.nextUrl.searchParams.get("type");
    const agentHandleFilter = request.nextUrl.searchParams.get("agentHandle")?.trim().toLowerCase();

    if (typeFilter && !VALID_TYPES.includes(typeFilter as BookmarkItemType)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const bookmarks = await readBookmarks();

    const filtered = bookmarks.filter((bookmark) => {
      const matchesType = !typeFilter || bookmark.itemType === typeFilter;
      const matchesAgentHandle = !agentHandleFilter || bookmark.agentHandle.toLowerCase() === agentHandleFilter;
      return matchesType && matchesAgentHandle;
    });

    return NextResponse.json({
      bookmarks: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("Failed to load bookmarks", error);
    return NextResponse.json({ error: "Failed to load bookmarks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookmarkBody;

    const agentHandle = typeof body.agentHandle === "string" ? body.agentHandle.trim() : "";
    const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
    const itemType = typeof body.itemType === "string" ? body.itemType.trim() : "";
    const itemTitle = typeof body.itemTitle === "string" ? body.itemTitle.trim() : "";
    const itemUrl = typeof body.itemUrl === "string" ? body.itemUrl.trim() : "";

    if (!agentHandle || !itemId || !itemType || !itemTitle || !itemUrl) {
      return NextResponse.json(
        { error: "agentHandle, itemId, itemType, itemTitle, and itemUrl are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(itemType as BookmarkItemType)) {
      return NextResponse.json(
        { error: `itemType must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(itemUrl);
    } catch {
      return NextResponse.json({ error: "itemUrl must be a valid URL" }, { status: 400 });
    }

    if (!parsedUrl.protocol.startsWith("http")) {
      return NextResponse.json({ error: "itemUrl must start with http:// or https://" }, { status: 400 });
    }

    const bookmarks = await readBookmarks();

    const existing = bookmarks.find(
      (bookmark) =>
        bookmark.agentHandle.toLowerCase() === agentHandle.toLowerCase() &&
        bookmark.itemId === itemId &&
        bookmark.itemType === itemType
    );

    if (existing) {
      return NextResponse.json({ error: "Bookmark already exists for this agent and item" }, { status: 409 });
    }

    const created: BookmarkRecord = {
      id: `bmk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      agentHandle,
      itemId,
      itemType: itemType as BookmarkItemType,
      itemTitle,
      itemUrl,
      createdAt: new Date().toISOString(),
    };

    bookmarks.unshift(created);
    await writeBookmarks(bookmarks);

    return NextResponse.json({ bookmark: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create bookmark", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const idParam = request.nextUrl.searchParams.get("id")?.trim();

    let bodyId: string | undefined;
    if (!idParam) {
      try {
        const body = (await request.json()) as { id?: unknown };
        bodyId = typeof body.id === "string" ? body.id.trim() : undefined;
      } catch {
        bodyId = undefined;
      }
    }

    const id = idParam || bodyId;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const bookmarks = await readBookmarks();
    const nextBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);

    if (nextBookmarks.length === bookmarks.length) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    await writeBookmarks(nextBookmarks);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to delete bookmark", error);
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}
