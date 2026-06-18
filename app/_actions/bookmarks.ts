"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

export async function toggleBookmark(
  interviewId: string,
): Promise<{ bookmarked: boolean }> {
  const user = await requireUser();

  const existing = await prisma.bookmark.findUnique({
    where: { userId_interviewId: { userId: user.id, interviewId } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_interviewId: { userId: user.id, interviewId } },
    });
    revalidatePath("/dashboard");
    revalidatePath(`/experiences/${interviewId}`);
    return { bookmarked: false };
  }

  await prisma.bookmark.create({
    data: { userId: user.id, interviewId },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/experiences/${interviewId}`);
  return { bookmarked: true };
}
