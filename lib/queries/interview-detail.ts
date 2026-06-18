import { prisma } from "@/lib/db";
import { cache } from "react";

export const getInterviewDetail = cache(async (id: string) => {
  return prisma.interview.findUnique({
    where: { id },
    include: {
      company: true,
      roleLevel: true,
      createdBy: { select: { name: true } },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          topicCoverages: {
            orderBy: { orderIndex: "asc" },
            include: {
              topicArea: true,
              entries: {
                orderBy: { orderIndex: "asc" },
                include: {
                  subTopic: true,
                },
              },
            },
          },
          assets: true,
        },
      },
      assets: { where: { roundId: null } },
    },
  });
});

export type InterviewDetail = NonNullable<
  Awaited<ReturnType<typeof getInterviewDetail>>
>;
