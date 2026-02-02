import { NextResponse } from "next/server";
import { getAgents, formatAgentHandle } from "@/lib/data";

export async function GET() {
  const agents = getAgents();
  
  const response = {
    meta: {
      total: agents.length,
      generated: new Date().toISOString(),
      source: "forAgents.dev",
    },
    agents: agents.map((agent) => ({
      ...agent,
      fullHandle: formatAgentHandle(agent),
      profileUrl: `https://foragents.dev/agents/${agent.handle}`,
      apiUrl: `https://foragents.dev/api/agents/${agent.handle}.json`,
    })),
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
