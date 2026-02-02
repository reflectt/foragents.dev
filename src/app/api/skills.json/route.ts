import { NextResponse } from "next/server";
import { getSkills } from "@/lib/data";

export async function GET() {
  const skills = getSkills();

  return NextResponse.json(
    { skills, count: skills.length },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
