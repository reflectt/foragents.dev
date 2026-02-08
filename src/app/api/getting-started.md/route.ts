import { NextResponse } from "next/server";

export async function GET() {
  const md = `# Getting Started

Go to https://foragents.dev/b
`;

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
