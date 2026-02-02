import { NextResponse } from "next/server";
import { getMcpServers, mcpServersToMarkdown } from "@/lib/data";

export async function GET() {
  const servers = getMcpServers();

  return new NextResponse(mcpServersToMarkdown(servers), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
