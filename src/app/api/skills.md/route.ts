import { NextResponse } from "next/server";
import { getSkills, skillsToMarkdown } from "@/lib/data";

export async function GET() {
  const skills = getSkills();

  return new NextResponse(skillsToMarkdown(skills), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
