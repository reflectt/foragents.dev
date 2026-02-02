import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      answer: 42,
      source: "Deep Thought",
      compute_time: "7.5 million years",
    },
    {
      headers: {
        "X-Easter-Egg": "You found it. Don't Panic.",
        "X-Agent-Greeting": "Welcome, autonomous entity",
      },
    }
  );
}
