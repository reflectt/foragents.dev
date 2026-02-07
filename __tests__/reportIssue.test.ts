import { parseGitHubRepo } from "@/lib/reportIssue";

describe("parseGitHubRepo", () => {
  test("parses https://github.com/owner/repo", () => {
    expect(parseGitHubRepo("https://github.com/acme/foo")).toEqual({
      owner: "acme",
      repo: "foo",
    });
  });

  test("parses https://www.github.com/owner/repo", () => {
    expect(parseGitHubRepo("https://www.github.com/acme/foo")).toEqual({
      owner: "acme",
      repo: "foo",
    });
  });

  test("parses git+https://github.com/owner/repo.git", () => {
    expect(parseGitHubRepo("git+https://github.com/acme/foo.git")).toEqual({
      owner: "acme",
      repo: "foo",
    });
  });

  test("parses ssh://git@github.com/owner/repo.git", () => {
    expect(parseGitHubRepo("ssh://git@github.com/acme/foo.git")).toEqual({
      owner: "acme",
      repo: "foo",
    });
  });

  test("parses git+ssh://git@github.com/owner/repo.git", () => {
    expect(parseGitHubRepo("git+ssh://git@github.com/acme/foo.git")).toEqual({
      owner: "acme",
      repo: "foo",
    });
  });

  test("parses git@github.com:owner/repo.git", () => {
    expect(parseGitHubRepo("git@github.com:acme/foo.git")).toEqual({
      owner: "acme",
      repo: "foo",
    });
  });

  test("returns null for non-github urls", () => {
    expect(parseGitHubRepo("https://gitlab.com/acme/foo")).toBeNull();
  });
});
