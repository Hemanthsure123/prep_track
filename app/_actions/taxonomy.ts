"use server";

import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminOrPanelist } from "@/lib/auth/guards";

// Helper to generate a slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Topic Area schemas & actions
const topicAreaSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  sortOrder: z.number().int().default(0),
});

export async function createTopicArea(input: z.infer<typeof topicAreaSchema>) {
  await requireAdminOrPanelist();
  const parsed = topicAreaSchema.parse(input);
  const slug = generateSlug(parsed.name);

  // Check unique slug
  const existing = await prisma.topicArea.findUnique({
    where: { slug },
  });
  if (existing) {
    throw new Error(`A topic area with name "${parsed.name}" already exists.`);
  }

  const area = await prisma.topicArea.create({
    data: {
      name: parsed.name,
      slug,
      sortOrder: parsed.sortOrder,
    },
  });

  revalidatePath("/admin/topic-areas");
  revalidatePath("/admin/sub-topics");
  revalidatePath("/admin/interviews/new");
  revalidateTag("analytics");
  return area;
}

export async function updateTopicArea(
  id: string,
  input: z.infer<typeof topicAreaSchema>,
) {
  await requireAdminOrPanelist();
  const parsed = topicAreaSchema.parse(input);
  const slug = generateSlug(parsed.name);

  // Check unique slug on other records
  const existing = await prisma.topicArea.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
  if (existing) {
    throw new Error(`Another topic area with name "${parsed.name}" already exists.`);
  }

  const area = await prisma.topicArea.update({
    where: { id },
    data: {
      name: parsed.name,
      slug,
      sortOrder: parsed.sortOrder,
    },
  });

  revalidatePath("/admin/topic-areas");
  revalidatePath("/admin/sub-topics");
  revalidatePath("/admin/interviews/new");
  revalidateTag("analytics");
  return area;
}

export async function deleteTopicArea(id: string) {
  await requireAdminOrPanelist();

  // Check if there are subtopics in this area
  const subtopicCount = await prisma.subTopic.count({
    where: { topicAreaId: id },
  });
  if (subtopicCount > 0) {
    throw new Error("Cannot delete a topic area that contains sub-topics. Move or delete them first.");
  }

  // Check if any topic coverages exist
  const coverageCount = await prisma.topicCoverage.count({
    where: { topicAreaId: id },
  });
  if (coverageCount > 0) {
    throw new Error("Cannot delete a topic area that is referenced by interview rounds.");
  }

  const area = await prisma.topicArea.delete({
    where: { id },
  });

  revalidatePath("/admin/topic-areas");
  revalidatePath("/admin/sub-topics");
  revalidatePath("/admin/interviews/new");
  revalidateTag("analytics");
  return area;
}

// SubTopic schemas & actions
const subTopicSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  topicAreaId: z.string().min(1, "Topic Area is required"),
});

export async function createSubTopic(input: z.infer<typeof subTopicSchema>) {
  await requireAdminOrPanelist();
  const parsed = subTopicSchema.parse(input);
  const slug = generateSlug(parsed.name);

  // Check unique slug under this topic area
  const existing = await prisma.subTopic.findFirst({
    where: {
      slug,
      topicAreaId: parsed.topicAreaId,
    },
  });
  if (existing) {
    throw new Error(`A sub-topic with name "${parsed.name}" already exists in this topic area.`);
  }

  const subTopic = await prisma.subTopic.create({
    data: {
      name: parsed.name,
      slug,
      topicAreaId: parsed.topicAreaId,
    },
  });

  revalidatePath("/admin/sub-topics");
  revalidatePath("/admin/interviews/new");
  revalidateTag("analytics");
  return subTopic;
}

export async function updateSubTopic(
  id: string,
  input: z.infer<typeof subTopicSchema>,
) {
  await requireAdminOrPanelist();
  const parsed = subTopicSchema.parse(input);
  const slug = generateSlug(parsed.name);

  // Check unique slug on other records
  const existing = await prisma.subTopic.findFirst({
    where: {
      slug,
      topicAreaId: parsed.topicAreaId,
      NOT: { id },
    },
  });
  if (existing) {
    throw new Error(`Another sub-topic with name "${parsed.name}" already exists in this topic area.`);
  }

  const subTopic = await prisma.subTopic.update({
    where: { id },
    data: {
      name: parsed.name,
      slug,
      topicAreaId: parsed.topicAreaId,
    },
  });

  revalidatePath("/admin/sub-topics");
  revalidatePath("/admin/interviews/new");
  revalidateTag("analytics");
  return subTopic;
}

export async function deleteSubTopic(id: string) {
  await requireAdminOrPanelist();

  // Check if it's referenced by any round entries
  const entryCount = await prisma.subTopicEntry.count({
    where: { subTopicId: id },
  });
  if (entryCount > 0) {
    throw new Error("Cannot delete a sub-topic that is referenced in existing interview rounds.");
  }

  const subTopic = await prisma.subTopic.delete({
    where: { id },
  });

  revalidatePath("/admin/sub-topics");
  revalidatePath("/admin/interviews/new");
  revalidateTag("analytics");
  return subTopic;
}
