import { NextRequest, NextResponse } from "next/server";
import { getSkills, skillsToMarkdown } from "@/lib/data";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format");
  const skills = getSkills();

  const acceptsMd =
    format === "md" ||
    request.headers.get("accept")?.includes("text/markdown");

  if (acceptsMd) {
    return new NextResponse(skillsToMarkdown(skills), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  return NextResponse.json(
    { skills, count: skills.length },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
