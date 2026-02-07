import { NextRequest } from "next/server";

import { __resetRateLimitsForTests } from "@/lib/requestLimits";
import { POST as viralEventPOST } from "@/app/api/metrics/viral/event/route";

describe("/api/metrics/viral/event request limits", () => {
  beforeEach(() => {
    __resetRateLimitsForTests();
  });

  test("rejects large bodies with 413", async () => {
    const huge = "x".repeat(10_000);
    const req = new NextRequest("http://localhost/api/metrics/viral/event", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "1.2.3.4",
      },
      body: JSON.stringify({ type: "artifact_viewed", artifact_id: huge }),
    });

    const res = await viralEventPOST(req);
    expect(res.status).toBe(413);

    const json = await res.json();
    expect(String(json.error)).toMatch(/too large/i);
  });

  test("rate limits after enough requests", async () => {
    const makeReq = () =>
      new NextRequest("http://localhost/api/metrics/viral/event", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "5.6.7.8",
        },
        body: JSON.stringify({ type: "artifact_viewed", artifact_id: "art_1" }),
      });

    let lastStatus = 0;
    for (let i = 0; i < 130; i++) {
      const res = await viralEventPOST(makeReq());
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }

    expect(lastStatus).toBe(429);
  });
});
