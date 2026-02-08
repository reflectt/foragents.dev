import { NextResponse } from "next/server";

import changelog from "@/data/changelog.json";

type ChangelogEntry = {
  date: string;
  title: string;
  description: string;
  tags: Array<string>;
};

export async function GET() {
  const entries = (Array.isArray(changelog) ? (changelog as ChangelogEntry[]) : []) ?? [];

  return NextResponse.json(
    {
      updated_at: new Date().toISOString(),
      entries,
      count: entries.length,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
