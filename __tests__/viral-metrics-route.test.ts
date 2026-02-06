import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

jest.mock("@/lib/server/supabase-admin", () => ({
  getSupabaseAdmin: jest.fn(() => null),
}));

async function loadSummaryRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/metrics/viral/summary/route");
  return { GET: mod.GET as typeof mod.GET };
}

async function loadArtifactsRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/metrics/viral/artifacts/route");
  return { GET: mod.GET as typeof mod.GET };
}

async function writeNdjson(filePath: string, rows: unknown[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf-8");
}

describe("/api/metrics/viral", () => {
  const tmpDir = path.join(process.cwd(), ".tmp-tests");
  const filePath = path.join(tmpDir, "viral_events.ndjson");

  beforeEach(async () => {
    process.env.VIRAL_METRICS_FILE_PATH = filePath;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  test("summary returns expected shape and respects window", async () => {
    const now = Date.now();
    await writeNdjson(filePath, [
      {
        type: "artifact_viewed",
        created_at: new Date(now - 10 * 60 * 1000).toISOString(),
        artifact_id: "art_1",
      },
      {
        type: "artifact_share_copied",
        created_at: new Date(now - 10 * 60 * 1000).toISOString(),
        artifact_id: "art_1",
      },
      {
        type: "comment_created",
        created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        artifact_id: "art_1",
      },
    ]);

    const { GET } = await loadSummaryRoute();
    const req = new NextRequest("http://localhost/api/metrics/viral/summary?window=60m");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.window).toBeTruthy();
    expect(typeof json.window.start).toBe("string");
    expect(typeof json.window.end).toBe("string");

    expect(json.totals).toBeTruthy();
    expect(typeof json.totals.total).toBe("number");
    expect(json.totals.counts).toMatchObject({
      artifact_created: expect.any(Number),
      artifact_viewed: expect.any(Number),
      artifact_share_copied: expect.any(Number),
      comment_created: expect.any(Number),
      rating_created_or_updated: expect.any(Number),
    });

    // 60m window should exclude the 2h-ago comment
    expect(json.totals.counts.artifact_viewed).toBe(1);
    expect(json.totals.counts.artifact_share_copied).toBe(1);
    expect(json.totals.counts.comment_created).toBe(0);
  });

  test("artifacts endpoint groups by artifact_id", async () => {
    const now = Date.now();
    await writeNdjson(filePath, [
      {
        type: "artifact_viewed",
        created_at: new Date(now - 2 * 60 * 1000).toISOString(),
        artifact_id: "art_a",
      },
      {
        type: "artifact_viewed",
        created_at: new Date(now - 1 * 60 * 1000).toISOString(),
        artifact_id: "art_a",
      },
      {
        type: "comment_created",
        created_at: new Date(now - 1 * 60 * 1000).toISOString(),
        artifact_id: "art_b",
      },
    ]);

    const { GET } = await loadArtifactsRoute();
    const req = new NextRequest("http://localhost/api/metrics/viral/artifacts?window=72h&limit=50");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.items[0]).toMatchObject({
      artifact_id: expect.any(String),
      score: expect.any(Number),
      counts: {
        artifact_created: expect.any(Number),
        artifact_viewed: expect.any(Number),
        artifact_share_copied: expect.any(Number),
        comment_created: expect.any(Number),
        rating_created_or_updated: expect.any(Number),
      },
    });

    const a = (json.items as Array<{ artifact_id: string; counts: { artifact_viewed: number } }>).find(
      (i) => i.artifact_id === "art_a"
    );
    expect(a?.counts.artifact_viewed).toBe(2);
  });
});
