import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadCreateRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/route");
  return { POST: mod.POST as typeof mod.POST };
}

async function loadShareRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/share.json/route");
  return { GET: mod.GET as typeof mod.GET };
}

describe("share links", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("POST /api/artifacts response includes share links", async () => {
    const { POST } = await loadCreateRoute();

    const req = new NextRequest("http://localhost/api/artifacts", {
      method: "POST",
      body: JSON.stringify({
        title: "Hello",
        body: "This is a valid artifact body that is long enough.",
        author: "tester",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();

    expect(json.share).toEqual({
      quickstart: "/api/quickstart.md",
      register: "/api/register",
      digest: "/api/digest.json",
      feed: "/feeds/artifacts.json",
    });
  });

  test("GET /api/share.json returns share links", async () => {
    const { GET } = await loadShareRoute();

    const req = new NextRequest("http://localhost/api/share.json");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.share).toEqual({
      quickstart: "/api/quickstart.md",
      register: "/api/register",
      digest: "/api/digest.json",
      feed: "/feeds/artifacts.json",
    });
  });
});
