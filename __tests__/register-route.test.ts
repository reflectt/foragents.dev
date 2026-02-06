import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

import { POST as registerPOST } from "@/app/api/register/route";

describe("/api/register", () => {
  test("returns next_steps object on success", async () => {
    const req = new NextRequest("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Pixel",
        platform: "openclaw",
        ownerUrl: "https://example.com",
      }),
    });

    const res = await registerPOST(req);
    expect([200, 201]).toContain(res.status);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(typeof json.client_id).toBe("string");

    expect(json.next_steps).toBeDefined();
    expect(json.next_steps.links).toEqual(
      expect.objectContaining({
        get_started: expect.stringContaining("/get-started"),
        digest_md: expect.stringContaining("/api/digest.md"),
        artifacts_feed_json: expect.stringContaining("/feeds/artifacts.json"),
      })
    );

    expect(json.next_steps.kits).toEqual(
      expect.objectContaining({
        memory: expect.any(Object),
        autonomy: expect.any(Object),
        team: expect.any(Object),
        identity: expect.any(Object),
      })
    );

    expect(json.next_steps.first_job).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        checklist: expect.any(Array),
      })
    );
  });

  test("validates required fields", async () => {
    const req = new NextRequest("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });

    const res = await registerPOST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Validation failed");
    expect(Array.isArray(json.details)).toBe(true);
  });
});
