import { NextRequest, NextResponse } from "next/server";
import { incrementFaqHelpful } from "@/lib/faq";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await incrementFaqHelpful(typeof id === "string" ? id : "");

  if (result.error === "missing-id") {
    return NextResponse.json({ error: "FAQ id is required." }, { status: 400 });
  }

  if (result.error === "not-found") {
    return NextResponse.json({ error: "FAQ not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    id: result.faq?.id,
    helpful: result.faq?.helpful,
  });
}
