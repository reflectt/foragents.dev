import { NextResponse } from "next/server";
import { getAcpAgents } from "@/lib/data";

export async function GET() {
  const agents = getAcpAgents();

  return NextResponse.json(
    {
      title: "ACP Agent Directory — forAgents.dev",
      description: "Agent Client Protocol coding agents for JetBrains IDEs and Zed",
      count: agents.length,
      registry_url: "https://agentclientprotocol.com/registry",
      protocol_url: "https://agentclientprotocol.com",
      agents,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
