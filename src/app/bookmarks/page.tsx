"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type BookmarkItemType = "skill" | "mcp" | "guide" | "bounty";

type Bookmark = {
  id: string;
  agentHandle: string;
  itemId: string;
  itemType: BookmarkItemType;
  itemTitle: string;
  itemUrl: string;
  createdAt: string;
};

type AddBookmarkForm = {
  agentHandle: string;
  itemId: string;
  itemType: BookmarkItemType;
  itemTitle: string;
  itemUrl: string;
};

const ITEM_TYPES: Array<{ value: BookmarkItemType; label: string }> = [
  { value: "skill", label: "Skill" },
  { value: "mcp", label: "MCP" },
  { value: "guide", label: "Guide" },
  { value: "bounty", label: "Bounty" },
];

const badgeClassByType: Record<BookmarkItemType, string> = {
  skill: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30",
  mcp: "bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/30",
  guide: "bg-[#0EA5E9]/10 text-[#67E8F9] border-[#0EA5E9]/30",
  bounty: "bg-[#F59E0B]/10 text-[#FCD34D] border-[#F59E0B]/30",
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | BookmarkItemType>("all");
  const [agentHandleInput, setAgentHandleInput] = useState("");
  const [agentHandleFilter, setAgentHandleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<AddBookmarkForm>({
    agentHandle: "@kai@reflectt.ai",
    itemId: "",
    itemType: "skill",
    itemTitle: "",
    itemUrl: "",
  });

  const loadBookmarks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query = new URLSearchParams();
      if (typeFilter !== "all") query.set("type", typeFilter);
      if (agentHandleFilter.trim()) query.set("agentHandle", agentHandleFilter.trim());

      const response = await fetch(`/api/bookmarks${query.toString() ? `?${query.toString()}` : ""}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to load bookmarks");
      }

      const data = (await response.json()) as { bookmarks?: Bookmark[] };
      const rows = Array.isArray(data.bookmarks) ? data.bookmarks : [];
      setBookmarks(rows);
    } catch (error) {
      console.error("Failed to load bookmarks", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to load bookmarks");
      setBookmarks([]);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, agentHandleFilter]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const sortedBookmarks = useMemo(
    () =>
      [...bookmarks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [bookmarks]
  );

  async function removeBookmark(id: string) {
    setRemovingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/bookmarks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to remove bookmark");
      }

      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id));
    } catch (error) {
      console.error("Failed to remove bookmark", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to remove bookmark");
    } finally {
      setRemovingId(null);
    }
  }

  async function addBookmark(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to add bookmark");
      }

      setForm((current) => ({
        ...current,
        itemId: "",
        itemTitle: "",
        itemUrl: "",
      }));

      await loadBookmarks();
    } catch (error) {
      console.error("Failed to add bookmark", error);
      setFormError(error instanceof Error ? error.message : "Failed to add bookmark");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🔖 Saved Bookmarks
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Persistent bookmarks for skills, MCP servers, guides, and bounties.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <Card className="bg-card/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Filters</CardTitle>
            <CardDescription>Filter by item type and agent handle.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[220px_1fr_auto] items-end">
              <div className="space-y-2">
                <Label htmlFor="typeFilter">Type</Label>
                <select
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as "all" | BookmarkItemType)}
                  className="h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm"
                >
                  <option value="all">All types</option>
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentHandle">Agent Handle</Label>
                <Input
                  id="agentHandle"
                  placeholder="@kai@reflectt.ai"
                  value={agentHandleInput}
                  onChange={(event) => setAgentHandleInput(event.target.value)}
                  className="bg-black/30 border-white/15"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setAgentHandleFilter(agentHandleInput.trim())}
                  className="bg-[#06D6A0] text-black hover:brightness-110"
                >
                  Apply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTypeFilter("all");
                    setAgentHandleInput("");
                    setAgentHandleFilter("");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Add Bookmark</CardTitle>
            <CardDescription>Add directly from this page (or wire this from item pages later).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addBookmark} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newAgentHandle">Agent Handle</Label>
                <Input
                  id="newAgentHandle"
                  value={form.agentHandle}
                  onChange={(event) => setForm((current) => ({ ...current, agentHandle: event.target.value }))}
                  placeholder="@kai@reflectt.ai"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newItemType">Item Type</Label>
                <select
                  id="newItemType"
                  value={form.itemType}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, itemType: event.target.value as BookmarkItemType }))
                  }
                  className="h-10 w-full rounded-md border border-white/15 bg-black/30 px-3 text-sm"
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newItemId">Item ID</Label>
                <Input
                  id="newItemId"
                  value={form.itemId}
                  onChange={(event) => setForm((current) => ({ ...current, itemId: event.target.value }))}
                  placeholder="filesystem-memory"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newItemTitle">Item Title</Label>
                <Input
                  id="newItemTitle"
                  value={form.itemTitle}
                  onChange={(event) => setForm((current) => ({ ...current, itemTitle: event.target.value }))}
                  placeholder="Filesystem Memory Skill"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="newItemUrl">Item URL</Label>
                <Input
                  id="newItemUrl"
                  type="url"
                  value={form.itemUrl}
                  onChange={(event) => setForm((current) => ({ ...current, itemUrl: event.target.value }))}
                  placeholder="https://foragents.dev/skills/filesystem-memory"
                  required
                />
              </div>

              {formError && <p className="md:col-span-2 text-sm text-red-400">{formError}</p>}

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#06D6A0] text-black hover:brightness-110"
                >
                  {isSubmitting ? "Adding..." : "Add Bookmark"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Bookmarked Items</h2>
            <p className="text-sm text-muted-foreground">{sortedBookmarks.length} total</p>
          </div>

          {isLoading ? (
            <Card className="bg-card/30 border-white/10">
              <CardContent className="py-14 text-center text-muted-foreground">Loading bookmarks...</CardContent>
            </Card>
          ) : errorMessage ? (
            <Card className="bg-red-950/20 border-red-500/30">
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-red-300">{errorMessage}</p>
                <Button variant="outline" onClick={loadBookmarks}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : sortedBookmarks.length === 0 ? (
            <Card className="bg-card/30 border-white/10">
              <CardContent className="py-14 text-center space-y-4">
                <div className="text-5xl">🗂️</div>
                <h3 className="text-xl font-semibold">No bookmarks found</h3>
                <p className="text-muted-foreground">
                  Try a different filter, or add your first bookmark above.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                  <span>Suggestions:</span>
                  <Link href="/skills" className="text-[#06D6A0] hover:underline">
                    Browse Skills
                  </Link>
                  <span>•</span>
                  <Link href="/mcp" className="text-[#06D6A0] hover:underline">
                    Explore MCP Servers
                  </Link>
                  <span>•</span>
                  <Link href="/guides" className="text-[#06D6A0] hover:underline">
                    Read Guides
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="bg-card/40 border-white/10">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg leading-tight">{bookmark.itemTitle}</CardTitle>
                        <CardDescription className="mt-1">Saved by {bookmark.agentHandle}</CardDescription>
                      </div>
                      <Badge className={badgeClassByType[bookmark.itemType]}>{bookmark.itemType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      <div>ID: {bookmark.itemId}</div>
                      <div>Saved: {new Date(bookmark.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={bookmark.itemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-[#06D6A0] text-black text-sm font-medium hover:brightness-110"
                      >
                        Open Item
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => removeBookmark(bookmark.id)}
                        disabled={removingId === bookmark.id}
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                      >
                        {removingId === bookmark.id ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
