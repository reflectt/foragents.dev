import { buildCompareUrl, parseCompareIdsParam } from "@/lib/compare";

describe("compare", () => {
  test("parseCompareIdsParam dedupes and clamps to 4", () => {
    expect(parseCompareIdsParam("1,2,2,3,4,5")).toEqual(["1", "2", "3", "4"]);
  });

  test("parseCompareIdsParam trims and ignores empties", () => {
    expect(parseCompareIdsParam(" 1, , 2 ,, ")).toEqual(["1", "2"]);
  });

  test("buildCompareUrl builds canonical url", () => {
    expect(buildCompareUrl(["1", "2", "3"])).toBe("/compare?a=1%2C2%2C3");
    expect(buildCompareUrl([])).toBe("/compare");
  });
});
