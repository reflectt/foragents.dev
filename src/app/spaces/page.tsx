/* eslint-disable react/no-unescaped-entities */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Visibility = "public" | "private" | "unlisted";
type Sort = "newest" | "members";

type Space = {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: Visibility;
  memberCount: number;
  skillCount: number;
  createdBy: string;
  createdAt: string;
  tags: string[];
  featured: boolean;
};

type SpacesResponse = {
  spaces: Space[];
  total: number;
};

const visibilityStyles: Record<Visibility, string> = {
  public: "bg-[#06D6A0]/15 border-[#06D6A0] text-[#06D6A0]",
  private: "bg-[#3B82F6]/15 border-[#3B82F6] text-[#3B82F6]",
  unlisted: "bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B]",
};

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | Visibility>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const [joinedSlugs, setJoinedSlugs] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [skillCount, setSkillCount] = useState("1");
  const [createdBy, setCreatedBy] = useState("@you");
  const [tags, setTags] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function fetchSpaces() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        params.set("sort", sort);
        params.set("visibility", visibilityFilter);

        const response = await fetch(`/api/spaces?${params.toString()}`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to load spaces");
        }

        const data = (await response.json()) as SpacesResponse;
        setSpaces(data.spaces);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Unable to fetch spaces";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchSpaces();
  }, [search, visibilityFilter, sort]);

  const stats = useMemo(
    () => ({
      totalSpaces: spaces.length,
      totalMembers: spaces.reduce((sum, space) => sum + space.memberCount, 0),
      totalSkills: spaces.reduce((sum, space) => sum + space.skillCount, 0),
    }),
    [spaces]
  );

  async function handleCreateSpace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          visibility,
          createdBy,
          skillCount: Number(skillCount),
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Failed to create space");
      }

      const created = (await response.json()) as Space;
      setSpaces((prev) => [created, ...prev]);
      setName("");
      setDescription("");
      setSkillCount("1");
      setTags("");
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Unable to create space";
      setError(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoinToggle(space: Space) {
    const isJoined = joinedSlugs.includes(space.slug);
    const action = isJoined ? "leave" : "join";

    try {
      const response = await fetch(`/api/spaces/${space.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Could not update membership");
      }

      const payload = (await response.json()) as { space: Space };
      setSpaces((prev) => prev.map((item) => (item.slug === payload.space.slug ? payload.space : item)));
      setJoinedSlugs((prev) =>
        isJoined ? prev.filter((slug) => slug !== space.slug) : [...prev, space.slug]
      );
    } catch {
      setError("Failed to update membership. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[320px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Collaboration Spaces
          </h1>
          <p className="text-xl text-foreground/80 mb-6">
            Discover shared spaces, join projects, and launch your own collaboration hub.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#06D6A0] font-bold text-2xl">{stats.totalSpaces}</span>
              <span className="text-muted-foreground">Spaces</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#8B5CF6] font-bold text-2xl">{stats.totalMembers}</span>
              <span className="text-muted-foreground">Members</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#3B82F6] font-bold text-2xl">{stats.totalSkills}</span>
              <span className="text-muted-foreground">Skills</span>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search spaces by name, tags, or description"
            className="bg-card/40 border-white/10"
          />
          <select
            value={visibilityFilter}
            onChange={(event) => setVisibilityFilter(event.target.value as "all" | Visibility)}
            className="h-10 px-3 rounded-md bg-card/40 border border-white/10 text-sm"
          >
            <option value="all">All visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="h-10 px-3 rounded-md bg-card/40 border border-white/10 text-sm"
          >
            <option value="newest">Sort: Newest</option>
            <option value="members">Sort: Most Members</option>
          </select>
        </div>

        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle>Create a new space</CardTitle>
            <CardDescription>
              Create a persistent collaboration space with visibility controls and tags. It's saved instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSpace} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Space name"
                required
                minLength={3}
                className="bg-card/40 border-white/10"
              />
              <Input
                value={createdBy}
                onChange={(event) => setCreatedBy(event.target.value)}
                placeholder="Created by (e.g. @you)"
                required
                className="bg-card/40 border-white/10"
              />
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what this space is for"
                required
                minLength={10}
                className="md:col-span-2 bg-card/40 border-white/10"
              />
              <Input
                value={skillCount}
                onChange={(event) => setSkillCount(event.target.value)}
                type="number"
                min={0}
                placeholder="Skill count"
                className="bg-card/40 border-white/10"
              />
              <Input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="Tags (comma separated)"
                className="bg-card/40 border-white/10"
              />
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as Visibility)}
                className="h-10 px-3 rounded-md bg-card/40 border border-white/10 text-sm"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
              <div className="flex items-center md:justify-end">
                <Button type="submit" disabled={isCreating} className="w-full md:w-auto">
                  {isCreating ? "Creating..." : "Create Space"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading spaces...</div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No spaces found</h3>
            <p className="text-sm text-muted-foreground">Try a different filter or create one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const joined = joinedSlugs.includes(space.slug);
              return (
                <Card
                  key={space.id}
                  className="h-full bg-card/30 border-white/10 hover:border-white/30 hover:bg-card/50 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <CardTitle className="text-xl line-clamp-2">{space.name}</CardTitle>
                      {space.featured && <Badge className="bg-[#8B5CF6] text-white">Featured</Badge>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={visibilityStyles[space.visibility]}>
                        {space.visibility}
                      </Badge>
                      {space.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="border-white/15 text-muted-foreground">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm line-clamp-3">{space.description}</CardDescription>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md border border-white/10 px-3 py-2">
                        <div className="text-muted-foreground">Members</div>
                        <div className="font-semibold">{space.memberCount}</div>
                      </div>
                      <div className="rounded-md border border-white/10 px-3 py-2">
                        <div className="text-muted-foreground">Skills</div>
                        <div className="font-semibold">{space.skillCount}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created by {space.createdBy} · {new Date(space.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant={joined ? "outline" : "default"}
                        onClick={() => handleJoinToggle(space)}
                        className="flex-1"
                      >
                        {joined ? "Leave" : "Join"}
                      </Button>
                      <Link
                        href={`/spaces/${space.id}`}
                        className="text-sm text-[#06D6A0] font-semibold hover:underline whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
