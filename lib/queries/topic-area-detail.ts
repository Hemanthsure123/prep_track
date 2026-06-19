import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export interface TopicAreaQuestion {
  id: string;
  question: string;
  referenceUrl: string | null;
  subTopic: { id: string; name: string; slug: string };
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    websiteUrl: string | null;
  };
  role: string;
  roleLevel: { id: string; name: string };
  year: number;
  interviewId: string;
}

export interface TopicAreaFilterMeta {
  companies: { id: string; name: string; slug: string }[];
  roleLevels: { id: string; name: string }[];
  years: number[];
  subTopics: { id: string; name: string; slug: string; count: number }[];
}

export interface TopicAreaData {
  area: { id: string; name: string; slug: string; subTopicCount: number };
  questions: TopicAreaQuestion[];
  meta: TopicAreaFilterMeta;
}

/**
 * Loads every question asked within a topic area, labeled with company + role.
 * The DB query is independent of any filters (filters are applied in-memory on
 * the page), so it caches cleanly per-slug and filter changes cost 0 round-trips.
 */
async function loadTopicAreaQuestions(slug: string): Promise<TopicAreaData | null> {
  const area = await prisma.topicArea.findFirst({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { subTopics: true } },
    },
  });
  if (!area) return null;

  const entries = await prisma.subTopicEntry.findMany({
    relationLoadStrategy: "join",
    where: {
      exactQuestionText: { not: null },
      subTopic: { topicAreaId: area.id },
    },
    select: {
      id: true,
      exactQuestionText: true,
      referenceUrl: true,
      subTopic: { select: { id: true, name: true, slug: true } },
      topicCoverage: {
        select: {
          round: {
            select: {
              interview: {
                select: {
                  id: true,
                  role: true,
                  year: true,
                  roleLevel: { select: { id: true, name: true } },
                  company: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      logoUrl: true,
                      websiteUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    take: 1000,
  });

  const questions: TopicAreaQuestion[] = [];
  for (const e of entries) {
    const interview = e.topicCoverage?.round?.interview;
    if (!interview || !interview.company || !e.exactQuestionText) continue;
    questions.push({
      id: e.id,
      question: e.exactQuestionText,
      referenceUrl: e.referenceUrl,
      subTopic: e.subTopic,
      company: interview.company,
      role: interview.role,
      roleLevel: interview.roleLevel,
      year: interview.year,
      interviewId: interview.id,
    });
  }

  // Recent-first, then grouped by company name for readability.
  questions.sort(
    (a, b) => b.year - a.year || a.company.name.localeCompare(b.company.name),
  );

  // Derive filter options from the full (unfiltered) set.
  const companyMap = new Map<string, { id: string; name: string; slug: string }>();
  const roleLevelMap = new Map<string, { id: string; name: string }>();
  const yearSet = new Set<number>();
  const subTopicMap = new Map<
    string,
    { id: string; name: string; slug: string; count: number }
  >();

  for (const q of questions) {
    companyMap.set(q.company.id, {
      id: q.company.id,
      name: q.company.name,
      slug: q.company.slug,
    });
    roleLevelMap.set(q.roleLevel.id, q.roleLevel);
    yearSet.add(q.year);
    const st = subTopicMap.get(q.subTopic.id);
    if (st) st.count += 1;
    else subTopicMap.set(q.subTopic.id, { ...q.subTopic, count: 1 });
  }

  return {
    area: {
      id: area.id,
      name: area.name,
      slug: area.slug,
      subTopicCount: area._count.subTopics,
    },
    questions,
    meta: {
      companies: [...companyMap.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      roleLevels: [...roleLevelMap.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      years: [...yearSet].sort((a, b) => b - a),
      subTopics: [...subTopicMap.values()].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name),
      ),
    },
  };
}

export const getTopicAreaQuestions = (slug: string) =>
  unstable_cache(
    () => loadTopicAreaQuestions(slug),
    ["topic-area-questions", slug],
    { revalidate: 300, tags: ["topic-questions"] },
  )();

/** Lightweight list of all topic areas for the index page. */
export const getTopicAreasIndex = unstable_cache(
  async () => {
    const areas = await prisma.topicArea.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { subTopics: true } },
      },
    });
    return areas.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      subTopicCount: a._count.subTopics,
    }));
  },
  ["topic-areas-index"],
  { revalidate: 300, tags: ["topic-questions"] },
);
