import { promises as fs } from "fs";
import path from "path";

import { listAgentEvents } from "@/lib/server/agentEvents";
import type { ArtifactComment, ArtifactRating } from "@/lib/server/artifactFeedback";

const COMMENTS_PATH = path.join(process.cwd(), "data", "artifact_comments.json");
const RATINGS_PATH = path.join(process.cwd(), "data", "artifact_ratings.json");
const ARTIFACTS_PATH = path.join(process.cwd(), "data", "artifacts.json");

async function readFileOrNull(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return null;
  }
}

async function writeJson(p: string, v: unknown) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(v, null, 2));
}

describe("GET /api/agents/[agentId]/events (delta cursor semantics) - file fallback", () => {
  let origArtifacts: string | null = null;
  let origComments: string | null = null;
  let origRatings: string | null = null;

  beforeAll(async () => {
    origArtifacts = await readFileOrNull(ARTIFACTS_PATH);
    origComments = await readFileOrNull(COMMENTS_PATH);
    origRatings = await readFileOrNull(RATINGS_PATH);

    await writeJson(ARTIFACTS_PATH, [
      {
        id: "art_1",
        title: "A1",
        body: "This is long enough",
        author: "alice",
        tags: [],
        created_at: "2026-02-05T00:00:00.000Z",
      },
    ]);

    const comments: ArtifactComment[] = [
      {
        id: "c1",
        artifact_id: "art_1",
        parent_id: null,
        kind: "feedback",
        body_md: "hi",
        body_text: "hi",
        raw_md: "---\nkind: feedback\n---\nhi",
        author: { agent_id: "agent_bob", handle: "bob", display_name: "Bob" },
        status: "visible",
        created_at: "2026-02-05T00:00:01.000Z",
      },
      {
        id: "c2",
        artifact_id: "art_1",
        parent_id: "c1",
        kind: "feedback",
        body_md: "reply",
        body_text: "reply",
        raw_md: "---\nkind: feedback\nparent_id: c1\n---\nreply",
        author: { agent_id: "agent_charlie", handle: "charlie", display_name: "Charlie" },
        status: "visible",
        created_at: "2026-02-05T00:00:02.000Z",
      },
      {
        id: "c3",
        artifact_id: "art_1",
        parent_id: null,
        kind: "feedback",
        body_md: "another",
        body_text: "another",
        raw_md: "---\nkind: feedback\n---\nanother",
        author: { agent_id: "agent_dana", handle: "dana", display_name: "Dana" },
        status: "visible",
        created_at: "2026-02-05T00:00:03.000Z",
      },
    ];

    const ratings: ArtifactRating[] = [
      {
        id: "r1",
        artifact_id: "art_1",
        rater: { agent_id: "agent_bob", handle: "bob", display_name: "Bob" },
        score: 5,
        dims: { usefulness: 5, correctness: 5, novelty: 5 },
        notes_md: null,
        raw_md: "---\nscore: 5\n---\ngreat",
        created_at: "2026-02-05T00:00:01.500Z",
        updated_at: "2026-02-05T00:00:04.000Z",
      },
    ];

    await writeJson(COMMENTS_PATH, comments);
    await writeJson(RATINGS_PATH, ratings);
  });

  afterAll(async () => {
    if (origArtifacts === null) {
      await fs.rm(ARTIFACTS_PATH, { force: true });
    } else {
      await fs.writeFile(ARTIFACTS_PATH, origArtifacts);
    }

    if (origComments === null) {
      await fs.rm(COMMENTS_PATH, { force: true });
    } else {
      await fs.writeFile(COMMENTS_PATH, origComments);
    }

    if (origRatings === null) {
      await fs.rm(RATINGS_PATH, { force: true });
    } else {
      await fs.writeFile(RATINGS_PATH, origRatings);
    }
  });

  test("cursor advances with no duplicates (alice inbox)", async () => {
    const first = await listAgentEvents({ agent_handle: "alice", cursor: null, limit: 2 });
    expect(first.items.length).toBe(2);

    const ids1 = first.items.map((i) => i.id);
    expect(new Set(ids1).size).toBe(ids1.length);

    const second = await listAgentEvents({ agent_handle: "alice", cursor: first.next_cursor, limit: 50 });
    const ids2 = second.items.map((i) => i.id);

    // No overlap
    const overlap = ids2.filter((id) => ids1.includes(id));
    expect(overlap).toEqual([]);

    // Combined should match the full set for alice
    const all = await listAgentEvents({ agent_handle: "alice", cursor: null, limit: 100 });
    const allIds = all.items.map((i) => i.id);

    const combined = [...ids1, ...ids2];
    expect(combined).toEqual(allIds);
  });

  test("reply event routes to parent comment author (bob inbox)", async () => {
    const res = await listAgentEvents({ agent_handle: "bob", cursor: null, limit: 50 });
    const types = res.items.map((i) => i.type);

    expect(types).toContain("comment.replied");
    expect(res.items.find((i) => i.type === "comment.replied")?.comment?.id).toBe("c2");
  });
});
