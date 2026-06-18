import { prisma } from "@/lib/db";

export async function search(q: string, limit = 10) {
  const cleaned = q.trim();
  if (!cleaned) return { companies: [], interviews: [], subTopics: [] };

  // Run parallel queries across Companies, Interviews (role or company), and SubTopics
  const [companies, interviews, subTopics] = await Promise.all([
    prisma.company.findMany({
      where: {
        name: {
          contains: cleaned,
          mode: "insensitive",
        },
      },
      include: {
        _count: {
          select: { interviews: true },
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.interview.findMany({
      where: {
        OR: [
          {
            role: {
              contains: cleaned,
              mode: "insensitive",
            },
          },
          {
            company: {
              name: {
                contains: cleaned,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      include: {
        company: true,
        roleLevel: true,
        rounds: {
          select: {
            roundType: true,
          },
        },
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.subTopic.findMany({
      where: {
        name: {
          contains: cleaned,
          mode: "insensitive",
        },
      },
      include: {
        topicArea: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    }),
  ]);

  return { companies, interviews, subTopics };
}
