import { NextResponse } from "next/server";
import { getAcpAgents, acpAgentsToMarkdown } from "@/lib/data";

export async function GET() {
  const agents = getAcpAgents();
  const markdown = acpAgentsToMarkdown(agents);

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
