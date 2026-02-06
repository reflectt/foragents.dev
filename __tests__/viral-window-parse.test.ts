import { parseWindowMs } from "@/lib/server/viralMetrics";

describe("parseWindowMs", () => {
  test("parses minutes/hours/days", () => {
    expect(parseWindowMs("5m").windowMs).toBe(5 * 60 * 1000);
    expect(parseWindowMs("2h").windowMs).toBe(2 * 60 * 60 * 1000);
    expect(parseWindowMs("3d").windowMs).toBe(3 * 24 * 60 * 60 * 1000);
  });

  test("defaults on invalid", () => {
    expect(parseWindowMs("abc").windowMs).toBe(72 * 60 * 60 * 1000);
    expect(parseWindowMs("0h").windowMs).toBe(72 * 60 * 60 * 1000);
    expect(parseWindowMs(null).windowMs).toBe(72 * 60 * 60 * 1000);
  });

  test("clamps huge windows to 30d", () => {
    expect(parseWindowMs("999d").windowMs).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
