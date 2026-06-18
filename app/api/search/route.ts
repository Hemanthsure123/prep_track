import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/queries/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const limit = Number(req.nextUrl.searchParams.get("limit") || 3);
  
  if (!q.trim()) {
    return NextResponse.json({ companies: [], interviews: [], subTopics: [] });
  }

  try {
    const results = await search(q, limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
