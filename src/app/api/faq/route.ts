import { NextRequest, NextResponse } from "next/server";
import {
  createFaqEntry,
  createFaqSubmission,
  FAQ_CATEGORIES,
  filterFaqs,
  isFaqCategory,
  readFaqData,
} from "@/lib/faq";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const search = request.nextUrl.searchParams.get("search");

  const categoryParam = category?.trim().toLowerCase() ?? "";

  if (categoryParam && categoryParam !== "all" && !isFaqCategory(categoryParam)) {
    return NextResponse.json(
      {
        error: "Invalid category",
        allowed: FAQ_CATEGORIES,
      },
      { status: 400 }
    );
  }

  const data = await readFaqData();
  const faqs = filterFaqs(data.faqs, { category, search });

  return NextResponse.json(
    {
      faqs,
      total: faqs.length,
      categories: FAQ_CATEGORIES,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const isFaqCreate =
      typeof body.answer === "string" || Array.isArray(body.tags) || typeof body.updatedAt === "string";

    if (isFaqCreate) {
      const result = await createFaqEntry(body);

      if (!result.faq || result.errors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", details: result.errors },
          { status: 400 }
        );
      }

      return NextResponse.json({ faq: result.faq }, { status: 201 });
    }

    const submission = await createFaqSubmission({
      question: body.question,
      category: body.category,
      email: body.email,
    });

    if (!submission.submission || submission.errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: submission.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Question submitted successfully.",
        submission: submission.submission,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}
