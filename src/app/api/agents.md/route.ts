import { NextResponse } from "next/server";
import { getAgents, agentsToMarkdown } from "@/lib/data";

export async function GET() {
  const agents = getAgents();
  const markdown = agentsToMarkdown(agents);

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
