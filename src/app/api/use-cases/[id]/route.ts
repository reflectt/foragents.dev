import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is no longer supported. Use POST /api/use-cases to create entries." },
    { status: 405 }
  );
}
