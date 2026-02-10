import { NextRequest, NextResponse } from "next/server";
import { readRoadmapItems, writeRoadmapItems } from "@/lib/server/roadmapStore";

type VoteRequest = {
  agentHandle?: unknown;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const items = await readRoadmapItems();
    const item = items.find((entry) => entry.id === id);

    if (!item) {
      return NextResponse.json({ error: "Roadmap item not found" }, { status: 404 });
    }

    return NextResponse.json({ item }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load roadmap item", error);
    return NextResponse.json({ error: "Failed to load roadmap item" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as VoteRequest;
    const agentHandle = typeof body.agentHandle === "string" ? body.agentHandle.trim() : "";

    const items = await readRoadmapItems();
    const itemIndex = items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Roadmap item not found" }, { status: 404 });
    }

    const item = items[itemIndex];
    const voters = item.voters ?? [];

    if (agentHandle) {
      const normalizedHandle = agentHandle.toLowerCase();
      const hasVoted = voters.some((voter) => voter.toLowerCase() === normalizedHandle);

      if (hasVoted) {
        return NextResponse.json(
          { error: "You have already voted for this feature", item },
          { status: 409 }
        );
      }
    }

    const updatedItem = {
      ...item,
      votes: item.votes + 1,
      voters: agentHandle ? [...voters, agentHandle] : voters,
      updatedAt: new Date().toISOString(),
    };

    items[itemIndex] = updatedItem;
    await writeRoadmapItems(items);

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Failed to submit roadmap vote", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
