import { NextRequest } from "next/server";

jest.mock("@/lib/artifacts", () => ({
  validateArtifactInput: jest.fn(() => []),
  createArtifact: jest.fn(async (input: { title: string; body: string }) => ({
    id: "a_1",
    title: input.title,
    body: input.body,
    author: "anon",
    tags: [],
    created_at: new Date().toISOString(),
    parent_artifact_id: null,
  })),
  getArtifacts: jest.fn(async () => []),
}));

jest.mock("@/lib/server/viralMetrics", () => ({
  logViralEvent: jest.fn(async () => null),
}));

import { POST as artifactsPOST } from "@/app/api/artifacts/route";
import { __resetRateLimitsForTests } from "@/lib/requestLimits";

describe("/api/artifacts request limits", () => {
  beforeEach(() => {
    __resetRateLimitsForTests();
  });

  test("rate limits after the configured max", async () => {
    const ip = "9.9.9.9";

    let lastStatus = 0;

    for (let i = 0; i < 21; i++) {
      const req = new NextRequest("http://localhost/api/artifacts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({ title: `t${i}`, body: "hello" }),
      });

      const res = await artifactsPOST(req);
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});
