/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";

export async function getSubTopicDetail(slug: string) {
  // 1. A concept slug (e.g. "dynamic-programming") can exist as several SubTopic
  // rows — one per topic area it appears in (DSA Easy, DSA Medium-Hard, …).
  // Fetch ALL rows with this slug and aggregate across them, otherwise we'd
  // undercount the companies/interviews that asked the concept.
  const subTopicRows = await prisma.subTopic.findMany({
    where: { slug },
    include: {
      topicArea: true,
      _count: { select: { entries: true } },
    },
  });

  if (subTopicRows.length === 0) return null;

  // Representative row (most entries) drives the title + area badge.
  const subTopic = subTopicRows.reduce((a, b) =>
    b._count.entries > a._count.entries ? b : a,
  );
  const subTopicIds = subTopicRows.map((s) => s.id);

  // 2. Fetch all entries across every same-slug row to calculate stats/coverages
  const entries = await prisma.subTopicEntry.findMany({
    relationLoadStrategy: "join",
    where: { subTopicId: { in: subTopicIds } },
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

  // 4. Fetch sibling subtopics in the representative TopicArea ("related cloud")
  const siblingSubTopics = await prisma.subTopic.findMany({
    where: {
      topicAreaId: subTopic.topicAreaId,
      id: { notIn: subTopicIds },
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
