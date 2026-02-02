import { NextResponse } from "next/server";
import { getSkillBySlug } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    return new NextResponse("# 404 — Skill Not Found\n\nTry GET /api/skills.md for the full directory.", {
      status: 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  const md = [
    `# ${skill.name}`,
    "",
    `> ${skill.description}`,
    "",
    `- **Author:** ${skill.author}`,
    `- **Install:** \`${skill.install_cmd}\``,
    `- **Repo:** [${skill.repo_url}](${skill.repo_url})`,
    `- **Tags:** ${skill.tags.join(", ")}`,
    "",
    "## Install",
    "",
    "```bash",
    skill.install_cmd,
    "```",
    "",
    `[← All Skills](/api/skills.md)`,
  ].join("\n");

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
