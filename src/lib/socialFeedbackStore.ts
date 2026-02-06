import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import type { AgentIdentity } from "@/lib/server/agent-auth";
import { decodeCursor, encodeCursor, type CommentKind } from "@/lib/socialFeedback";

export type ArtifactComment = {
  id: string;
  artifact_id: string;
  parent_id: string | null;
  kind: CommentKind;
  body_md: string;
  body_text: string | null;
  author: { agent_id: string; handle?: string; display_name?: string };
  created_at: string;
};

export type ArtifactRating = {
  id: string;
  artifact_id: string;
  rater: { agent_id: string; handle?: string };
  score: number;
  dims: Record<string, number> | null;
  notes_md: string | null;
  created_at: string;
  updated_at: string;
};

export type RatingsSummary = {
  artifact_id: string;
  count: number;
  avg: number | null;
  dims_avg: Record<string, number>;
  updated_at: string;
};

const COMMENTS_PATH = path.join(process.cwd(), "data", "artifact_comments.json");
const RATINGS_PATH = path.join(process.cwd(), "data", "artifact_ratings.json");

function isMissingTable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  return code === "PGRST205";
}

async function readJsonArrayFile<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArrayFile<T>(filePath: string, items: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(items, null, 2));
}

export async function createComment(params: {
  artifact_id: string;
  parent_id: string | null;
  kind: CommentKind;
  raw_md: string;
  body_md: string;
  body_text: string | null;
  author: AgentIdentity;
}): Promise<ArtifactComment> {
  const supabase = getSupabase();

  const row = {
    artifact_id: params.artifact_id,
    parent_id: params.parent_id,
    kind: params.kind,

    author_agent_id: params.author.agent_id,
    author_handle: params.author.handle ?? null,
    author_display_name: params.author.display_name ?? null,

    raw_md: params.raw_md,
    body_md: params.body_md,
    body_text: params.body_text,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_comments")
      .insert(row)
      .select(
        "id, artifact_id, parent_id, kind, body_md, body_text, author_agent_id, author_handle, author_display_name, created_at"
      )
      .single();

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase createComment error:", error);
        throw new Error("Database error");
      }
      // else fall back to file
    } else {
      return {
        id: data.id,
        artifact_id: data.artifact_id,
        parent_id: data.parent_id,
        kind: data.kind,
        body_md: data.body_md,
        body_text: data.body_text,
        author: {
          agent_id: data.author_agent_id,
          handle: data.author_handle ?? undefined,
          display_name: data.author_display_name ?? undefined,
        },
        created_at: data.created_at,
      };
    }
  }

  const items = await readJsonArrayFile<unknown>(COMMENTS_PATH);
  const comment: ArtifactComment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    artifact_id: params.artifact_id,
    parent_id: params.parent_id,
    kind: params.kind,
    body_md: params.body_md,
    body_text: params.body_text,
    author: {
      agent_id: params.author.agent_id,
      handle: params.author.handle,
      display_name: params.author.display_name,
    },
    created_at: new Date().toISOString(),
  };
  items.unshift({
    ...comment,
    // also store raw for reproducibility in file
    raw_md: params.raw_md,
  });
  await writeJsonArrayFile(COMMENTS_PATH, items);
  return comment;
}

export async function assertValidParent(params: {
  artifact_id: string;
  parent_id: string;
}): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_comments")
      .select("id, artifact_id")
      .eq("id", params.parent_id)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase assertValidParent error:", error);
        throw new Error("Database error");
      }
      // else fall back
    } else {
      return !!data && data.artifact_id === params.artifact_id;
    }
  }

  const items = await readJsonArrayFile<unknown>(COMMENTS_PATH);
  const found = (items as Array<{ id?: unknown; artifact_id?: unknown }>).find(
    (c) => String(c.id) === params.parent_id
  );
  return !!found && String(found.artifact_id) === params.artifact_id;
}

export async function listComments(params: {
  artifact_id: string;
  limit?: number;
  cursor?: string | null;
  order?: "asc" | "desc";
  include?: "all" | "top";
}): Promise<{ items: ArtifactComment[]; next_cursor: string | null; updated_at: string }> {
  const limit = Math.min(100, Math.max(1, params.limit ?? 50));
  const order = params.order ?? "asc";
  const include = params.include ?? "all";
  const decoded = decodeCursor(params.cursor ?? null);

  const supabase = getSupabase();
  if (supabase) {
    let q = supabase
      .from("artifact_comments")
      .select(
        "id, artifact_id, parent_id, kind, body_md, body_text, author_agent_id, author_handle, author_display_name, created_at"
      )
      .eq("artifact_id", params.artifact_id)
      .eq("status", "visible")
      .order("created_at", { ascending: order === "asc" })
      .order("id", { ascending: order === "asc" })
      .limit(limit + 1);

    if (include === "top") {
      q = q.is("parent_id", null);
    }

    if (decoded) {
      // cursor is last seen item; fetch after it for asc, before it for desc.
      if (order === "asc") {
        q = q
          .or(
            `created_at.gt.${decoded.created_at},and(created_at.eq.${decoded.created_at},id.gt.${decoded.id})`
          );
      } else {
        q = q
          .or(
            `created_at.lt.${decoded.created_at},and(created_at.eq.${decoded.created_at},id.lt.${decoded.id})`
          );
      }
    }

    const { data, error } = await q;
    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase listComments error:", error);
        throw new Error("Database error");
      }
      // else fallback
    } else {
      const rows = data ?? [];
      const slice = rows.slice(0, limit);
      const last = slice[slice.length - 1];
      const next_cursor = rows.length > limit && last ? encodeCursor({ created_at: last.created_at, id: last.id }) : null;
      const updated_at = new Date().toISOString();
      return {
        items: slice.map((d) => ({
          id: d.id,
          artifact_id: d.artifact_id,
          parent_id: d.parent_id,
          kind: d.kind,
          body_md: d.body_md,
          body_text: d.body_text,
          author: {
            agent_id: d.author_agent_id,
            handle: d.author_handle ?? undefined,
            display_name: d.author_display_name ?? undefined,
          },
          created_at: d.created_at,
        })),
        next_cursor,
        updated_at,
      };
    }
  }

  const all = await readJsonArrayFile<unknown>(COMMENTS_PATH);
  const visible = (all as Array<{ artifact_id?: unknown; parent_id?: unknown; created_at?: unknown; id?: unknown }>).filter(
    (c) => String(c.artifact_id) === params.artifact_id
  );
  const filtered = include === "top" ? visible.filter((c) => c.parent_id == null) : visible;

  // File is newest-first (unshift). We'll sort for stable ordering.
  const sorted = filtered.sort((a, b) => {
    const ta = new Date(String(a.created_at)).getTime();
    const tb = new Date(String(b.created_at)).getTime();
    if (ta !== tb) return order === "asc" ? ta - tb : tb - ta;
    return order === "asc" ? String(a.id).localeCompare(String(b.id)) : String(b.id).localeCompare(String(a.id));
  });

  let start = 0;
  if (decoded) {
    start =
      sorted.findIndex((c) => String(c.created_at) === decoded.created_at && String(c.id) === decoded.id) + 1;
    if (start < 0) start = 0;
  }

  const page = sorted.slice(start, start + limit);
  const last = page[page.length - 1];
  const next_cursor =
    page.length === limit && start + limit < sorted.length && last
      ? encodeCursor({ created_at: String(last.created_at), id: String(last.id) })
      : null;

  const updated_at = new Date().toISOString();

  return {
    items: page.map((c) => {
      const authorRaw = (c as { author?: unknown }).author;
      const author =
        authorRaw && typeof authorRaw === "object"
          ? {
              agent_id: String((authorRaw as { agent_id?: unknown }).agent_id ?? "unknown"),
              handle:
                typeof (authorRaw as { handle?: unknown }).handle === "string"
                  ? (authorRaw as { handle: string }).handle
                  : undefined,
              display_name:
                typeof (authorRaw as { display_name?: unknown }).display_name === "string"
                  ? (authorRaw as { display_name: string }).display_name
                  : undefined,
            }
          : { agent_id: "unknown" };

      return {
        id: String((c as { id?: unknown }).id),
        artifact_id: String((c as { artifact_id?: unknown }).artifact_id),
        parent_id:
          (c as { parent_id?: unknown }).parent_id == null
            ? null
            : String((c as { parent_id?: unknown }).parent_id),
        kind: String((c as { kind?: unknown }).kind) as CommentKind,
        body_md: String((c as { body_md?: unknown }).body_md ?? ""),
        body_text:
          (c as { body_text?: unknown }).body_text == null
            ? null
            : String((c as { body_text?: unknown }).body_text),
        author,
        created_at: String((c as { created_at?: unknown }).created_at),
      };
    }),
    next_cursor,
    updated_at,
  };
}

export async function upsertRating(params: {
  artifact_id: string;
  score: number;
  dims: Record<string, number> | null;
  raw_md: string;
  notes_md: string | null;
  rater: AgentIdentity;
}): Promise<{ rating: ArtifactRating; created: boolean }> {
  const supabase = getSupabase();

  const now = new Date().toISOString();

  const row = {
    artifact_id: params.artifact_id,
    rater_agent_id: params.rater.agent_id,
    rater_handle: params.rater.handle ?? null,
    score: params.score,
    dims: params.dims,
    raw_md: params.raw_md,
    notes_md: params.notes_md,
    updated_at: now,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("artifact_ratings")
      .upsert(row, { onConflict: "artifact_id,rater_agent_id" })
      .select("id, artifact_id, rater_agent_id, rater_handle, score, dims, notes_md, created_at, updated_at")
      .single();

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase upsertRating error:", error);
        throw new Error("Database error");
      }
      // else fallback
    } else {
      // Supabase doesn't tell us created vs updated in REST; approximate.
      const created = data.created_at === data.updated_at;
      return {
        created,
        rating: {
          id: data.id,
          artifact_id: data.artifact_id,
          rater: { agent_id: data.rater_agent_id, handle: data.rater_handle ?? undefined },
          score: data.score,
          dims: (data.dims as unknown as Record<string, number> | null) ?? null,
          notes_md: data.notes_md ?? null,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    }
  }

  const items = await readJsonArrayFile<unknown>(RATINGS_PATH);
  const key = `${params.artifact_id}::${params.rater.agent_id}`;
  const idx = (items as Array<{ artifact_id?: unknown; rater?: { agent_id?: unknown } | null; rater_agent_id?: unknown }>).findIndex(
    (r) => `${String(r.artifact_id)}::${String(r.rater?.agent_id ?? r.rater_agent_id)}` === key
  );

  if (idx === -1) {
    const rating: ArtifactRating = {
      id: `rat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      artifact_id: params.artifact_id,
      rater: { agent_id: params.rater.agent_id, handle: params.rater.handle },
      score: params.score,
      dims: params.dims,
      notes_md: params.notes_md,
      created_at: now,
      updated_at: now,
    };

    items.unshift({ ...rating, raw_md: params.raw_md });
    await writeJsonArrayFile(RATINGS_PATH, items);
    return { rating, created: true };
  }

  const existing = items[idx] as Record<string, unknown>;
  const existingRater = existing["rater"] as unknown;
  const updated: ArtifactRating = {
    id: String(existing["id"]),
    artifact_id: String(existing["artifact_id"]),
    rater:
      existingRater && typeof existingRater === "object"
        ? {
            agent_id: String((existingRater as { agent_id?: unknown }).agent_id ?? existing["rater_agent_id"]),
            handle:
              typeof (existingRater as { handle?: unknown }).handle === "string"
                ? (existingRater as { handle: string }).handle
                : typeof existing["rater_handle"] === "string"
                  ? String(existing["rater_handle"])
                  : undefined,
          }
        : {
            agent_id: String(existing["rater_agent_id"]),
            handle: typeof existing["rater_handle"] === "string" ? String(existing["rater_handle"]) : undefined,
          },
    score: params.score,
    dims: params.dims,
    notes_md: params.notes_md,
    created_at: typeof existing["created_at"] === "string" ? String(existing["created_at"]) : now,
    updated_at: now,
  };

  items[idx] = { ...existing, ...updated, raw_md: params.raw_md };
  await writeJsonArrayFile(RATINGS_PATH, items);
  return { rating: updated, created: false };
}

export async function getRatingsSummary(params: { artifact_id: string }): Promise<RatingsSummary> {
  const supabase = getSupabase();
  if (supabase) {
    // Use PostgREST aggregate functions.
    // Note: Supabase JS does not expose multi-aggregates elegantly in v2 REST; do a simple select and compute in JS.
    const { data, error } = await supabase
      .from("artifact_ratings")
      .select("score, dims, updated_at")
      .eq("artifact_id", params.artifact_id);

    if (error) {
      if (!isMissingTable(error)) {
        console.error("Supabase getRatingsSummary error:", error);
        throw new Error("Database error");
      }
      // else fallback
    } else {
      const rows = data ?? [];
      return computeSummary(params.artifact_id, rows);
    }
  }

  const items = await readJsonArrayFile<unknown>(RATINGS_PATH);
  const rows = (items as Array<{ artifact_id?: unknown }>).filter(
    (r) => String(r.artifact_id) === params.artifact_id
  );
  return computeSummary(params.artifact_id, rows);
}

function computeSummary(artifact_id: string, rows: Array<Record<string, unknown>>): RatingsSummary {
  const count = rows.length;
  const scores = rows
    .map((r) => Number((r as { score?: unknown }).score))
    .filter((n) => Number.isFinite(n));
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  const dimsKeys = ["usefulness", "correctness", "novelty"];
  const dims_avg: Record<string, number> = {};
  for (const k of dimsKeys) {
    const vals: number[] = [];
    for (const r of rows) {
      const dims = (r as { dims?: unknown }).dims;
      let v: unknown = undefined;
      if (dims && typeof dims === "object") {
        v = (dims as Record<string, unknown>)[k];
      }
      const n = Number(v);
      if (Number.isFinite(n)) vals.push(n);
    }
    if (vals.length) dims_avg[k] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const updated_at =
    rows
      .map((r) => r.updated_at ?? r.created_at)
      .filter((s) => typeof s === "string")
      .sort()
      .at(-1) ?? new Date().toISOString();

  return { artifact_id, count, avg: avg === null ? null : Number(avg.toFixed(4)), dims_avg, updated_at };
}
