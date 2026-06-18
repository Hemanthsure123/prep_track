/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";

export async function getSubTopicDetail(slug: string) {
  // 1. Fetch the main subtopic details and its parent topic area
  const subTopic = await prisma.subTopic.findFirst({
    where: { slug },
    include: {
      topicArea: true,
    },
  });

  if (!subTopic) return null;

  // 2. Fetch all entries referencing this subtopic to calculate stats and list coverages
  const entries = await prisma.subTopicEntry.findMany({
    where: { subTopicId: subTopic.id },
    include: {
      topicCoverage: {
        include: {
          round: {
            include: {
              interview: {
                include: {
                  company: true,
                  roleLevel: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // 3. Compute stats
  const interviewMap = new Map<string, any>();
  const companyMap = new Map<string, { company: any; interviews: Map<string, any> }>();
  const roundIds = new Set<string>();

  entries.forEach((entry) => {
    const round = entry.topicCoverage?.round;
    if (!round) return;

    roundIds.add(round.id);
    const interview = round.interview;
    if (!interview) return;

    // Direct interview mapping
    interviewMap.set(interview.id, interview);

    // Grouping by company
    const company = interview.company;
    if (!company) return;

    if (!companyMap.has(company.id)) {
      companyMap.set(company.id, {
        company,
        interviews: new Map<string, any>(),
      });
    }

    const companyData = companyMap.get(company.id)!;
    if (!companyData.interviews.has(interview.id)) {
      companyData.interviews.set(interview.id, {
        ...interview,
        exactQuestions: [] as string[],
      });
    }

    if (entry.exactQuestionText) {
      companyData.interviews.get(interview.id)!.exactQuestions.push(entry.exactQuestionText);
    }
  });

  // Calculate statistics
  const totalCoveredTimes = entries.length;
  const uniqueInterviewsCount = interviewMap.size;
  const uniqueCompaniesCount = companyMap.size;
  const uniqueRoundsCount = roundIds.size;
  const avgTimesPerRound =
    uniqueRoundsCount > 0 ? (totalCoveredTimes / uniqueRoundsCount).toFixed(1) : "0.0";

  // Grouped companies array
  const groupedCompanies = Array.from(companyMap.values()).map((c) => ({
    company: c.company,
    interviews: Array.from(c.interviews.values()),
    count: c.interviews.size,
  })).sort((a, b) => b.count - a.count);

  // 4. Fetch sibling subtopics in the same TopicArea to display a "related cloud"
  const siblingSubTopics = await prisma.subTopic.findMany({
    where: {
      topicAreaId: subTopic.topicAreaId,
      id: { not: subTopic.id },
    },
    include: {
      _count: {
        select: { entries: true },
      },
    },
    orderBy: {
      entries: {
        _count: "desc",
      },
    },
    take: 12,
  });

  const formattedSiblings = siblingSubTopics.map((st) => ({
    id: st.id,
    name: st.name,
    slug: st.slug,
    count: st._count.entries,
  }));

  return {
    subTopic,
    stats: {
      totalCoveredTimes,
      uniqueInterviewsCount,
      uniqueCompaniesCount,
      avgTimesPerRound: parseFloat(avgTimesPerRound),
    },
    groupedCompanies,
    relatedSubTopics: formattedSiblings,
  };
}
