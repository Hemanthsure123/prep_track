import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentDbUser } from "@/lib/auth/guards";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const user = await getCurrentDbUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PANELIST")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { batchId } = await params;

  const grouped = await prisma.importRow.groupBy({
    by: ["status"],
    where: { batchId },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.status] = g._count._all;

  return NextResponse.json({ batchId, counts });
}
