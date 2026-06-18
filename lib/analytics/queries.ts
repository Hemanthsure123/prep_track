import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const CACHE_TTL = 300; // 5 minutes
const TAG = "analytics";

export const getOverviewKpis = unstable_cache(
  async () => {
    const [
      totalInterviews,
      totalRounds,
      totalCoverages,
      totalEntries,
      totalCompanies,
      totalSubTopics,
    ] = await Promise.all([
      prisma.interview.count(),
      prisma.round.count(),
      prisma.topicCoverage.count(),
      prisma.subTopicEntry.count(),
      prisma.company.count(),
      prisma.subTopic.count(),
    ]);
    return {
      totalInterviews,
      totalRounds,
      totalCoverages,
      totalEntries,
      totalCompanies,
      totalSubTopics,
    };
  },
  ["overview-kpis"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

export const getTopSubTopics = unstable_cache(
  async (limit = 20) => {
    const data = await prisma.subTopic.findMany({
      take: limit,
      include: {
        topicArea: { select: { name: true } },
        _count: { select: { entries: true } },
      },
      orderBy: {
        entries: {
          _count: "desc",
        },
      },
    });
    return data.map((x) => ({
      id: x.id,
      name: x.name,
      topicAreaName: x.topicArea.name,
      count: x._count.entries,
    }));
  },
  ["top-sub-topics"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

export const getTopicAreaFrequency = unstable_cache(
  async () => {
    const data = await prisma.topicArea.findMany({
      include: {
        _count: { select: { topicCoverages: true } },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
    return data.map((x) => ({
      id: x.id,
      name: x.name,
      slug: x.slug,
      count: x._count.topicCoverages,
    }));
  },
  ["topic-area-frequency"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

export const getSubmissionsOverTime = unstable_cache(
  async (weeks = 26) => {
    const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);
    const rows = await prisma.$queryRaw<{ week: Date; count: bigint }[]>`
      SELECT date_trunc('week', "publishedAt") AS week, COUNT(*) AS count
      FROM "Interview"
      WHERE "publishedAt" >= ${since}
      GROUP BY week
      ORDER BY week ASC;
    `;
    return rows.map((r) => ({
      week: r.week.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: Number(r.count),
    }));
  },
  ["submissions-over-time"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

export const getTopCompaniesByInterviewCount = unstable_cache(
  async (limit = 10) => {
    const data = await prisma.company.findMany({
      take: limit,
      include: {
        _count: { select: { interviews: true } },
      },
      orderBy: {
        interviews: {
          _count: "desc",
        },
      },
    });
    return data.map((x) => ({
      id: x.id,
      name: x.name,
      slug: x.slug,
      count: x._count.interviews,
    }));
  },
  ["top-companies"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

// ============ TOPIC DRILL-DOWN ============

export const getSubTopicsForTopicArea = unstable_cache(
  async (topicAreaId: string) => {
    const data = await prisma.subTopic.findMany({
      where: { topicAreaId },
      include: {
        _count: { select: { entries: true } },
      },
      orderBy: {
        entries: {
          _count: "desc",
        },
      },
    });
    return data.map((x) => ({
      id: x.id,
      name: x.name,
      slug: x.slug,
      count: x._count.entries,
    }));
  },
  ["sub-topics-for-area"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

export const getCompaniesAskingSubTopic = unstable_cache(
  async (subTopicId: string) => {
    const rows = await prisma.$queryRaw<{ companyId: string; companyName: string; count: bigint }[]>`
      SELECT c.id AS "companyId", c.name AS "companyName", COUNT(*) AS count
      FROM "SubTopicEntry" e
      JOIN "TopicCoverage" tc ON e."topicCoverageId" = tc.id
      JOIN "Round" r ON tc."roundId" = r.id
      JOIN "Interview" i ON r."interviewId" = i.id
      JOIN "Company" c ON i."companyId" = c.id
      WHERE e."subTopicId" = ${subTopicId}
      GROUP BY c.id, c.name
      ORDER BY count DESC;
    `;
    return rows.map((r) => ({
      companyId: r.companyId,
      companyName: r.companyName,
      count: Number(r.count),
    }));
  },
  ["companies-asking-sub-topic"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

// ============ COMPANY COVERAGE ============

export const getCoverageHeatmap = unstable_cache(
  async () => {
    const rows = await prisma.$queryRaw<{ companyId: string; companyName: string; topicAreaId: string; topicAreaName: string; count: bigint }[]>`
      SELECT
        c.id AS "companyId",
        c.name AS "companyName",
        ta.id AS "topicAreaId",
        ta.name AS "topicAreaName",
        COUNT(tc.id) AS count
      FROM "Company" c
      CROSS JOIN "TopicArea" ta
      LEFT JOIN "Interview" i ON i."companyId" = c.id
      LEFT JOIN "Round" r ON r."interviewId" = i.id
      LEFT JOIN "TopicCoverage" tc ON tc."roundId" = r.id AND tc."topicAreaId" = ta.id
      GROUP BY c.id, c.name, ta.id, ta.name, ta."sortOrder"
      ORDER BY c.name ASC, ta."sortOrder" ASC;
    `;
    return rows.map((r) => ({
      companyId: r.companyId,
      companyName: r.companyName,
      topicAreaId: r.topicAreaId,
      topicAreaName: r.topicAreaName,
      count: Number(r.count),
    }));
  },
  ["coverage-heatmap"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

export const getCompanyTopicProfile = unstable_cache(
  async (companyIds: string[]) => {
    if (companyIds.length === 0) return [];
    const rows = await prisma.$queryRaw<{ companyId: string; topicAreaId: string; topicAreaName: string; count: bigint }[]>`
      SELECT
        i."companyId" AS "companyId",
        ta.id AS "topicAreaId",
        ta.name AS "topicAreaName",
        COUNT(tc.id) AS count
      FROM "TopicCoverage" tc
      JOIN "Round" r ON tc."roundId" = r.id
      JOIN "Interview" i ON r."interviewId" = i.id
      JOIN "TopicArea" ta ON tc."topicAreaId" = ta.id
      WHERE i."companyId" = ANY(${companyIds}::text[])
      GROUP BY i."companyId", ta.id, ta.name
      ORDER BY count DESC;
    `;
    return rows.map((r) => ({
      companyId: r.companyId,
      topicAreaId: r.topicAreaId,
      topicAreaName: r.topicAreaName,
      count: Number(r.count),
    }));
  },
  ["company-topic-profile"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

// ============ ROLE LEVEL ============

export const getRoleLevelTopicProfile = unstable_cache(
  async () => {
    const rows = await prisma.$queryRaw<{ roleLevelId: string; roleLevelName: string; topicAreaId: string; topicAreaName: string; count: bigint }[]>`
      SELECT
        rl.id AS "roleLevelId",
        rl.name AS "roleLevelName",
        ta.id AS "topicAreaId",
        ta.name AS "topicAreaName",
        COUNT(tc.id) AS count
      FROM "RoleLevel" rl
      JOIN "Interview" i ON i."roleLevelId" = rl.id
      JOIN "Round" r ON r."interviewId" = i.id
      JOIN "TopicCoverage" tc ON tc."roundId" = r.id
      JOIN "TopicArea" ta ON tc."topicAreaId" = ta.id
      GROUP BY rl.id, rl.name, ta.id, ta.name
      ORDER BY rl.name ASC, count DESC;
    `;
    return rows.map((r) => ({
      roleLevelId: r.roleLevelId,
      roleLevelName: r.roleLevelName,
      topicAreaId: r.topicAreaId,
      topicAreaName: r.topicAreaName,
      count: Number(r.count),
    }));
  },
  ["role-level-topic-profile"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

// ============ COVERAGE GAPS ============

export const getCoverageGaps = unstable_cache(
  async (thresholdInterviews = 5, monthsSinceLast = 6) => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsSinceLast);

    const [thinTopicAreas, staleCompanies, thinRoleLevels] = await Promise.all([
      prisma.topicArea.findMany({
        orderBy: { topicCoverages: { _count: "asc" } },
        include: { _count: { select: { topicCoverages: true } } },
      }),
      prisma.company.findMany({
        where: {
          interviews: {
            none: { publishedAt: { gte: cutoff } },
          },
        },
        include: { _count: { select: { interviews: true } } },
      }),
      prisma.roleLevel.findMany({
        orderBy: { interviews: { _count: "asc" } },
        include: { _count: { select: { interviews: true } } },
      }),
    ]);

    return {
      thinTopicAreas: thinTopicAreas
        .filter((ta) => ta._count.topicCoverages < thresholdInterviews)
        .map((x) => ({ id: x.id, name: x.name, count: x._count.topicCoverages })),
      staleCompanies: staleCompanies.map((x) => ({
        id: x.id,
        name: x.name,
        slug: x.slug,
        logoUrl: x.logoUrl,
        count: x._count.interviews,
      })),
      thinRoleLevels: thinRoleLevels
        .filter((rl) => rl._count.interviews < thresholdInterviews)
        .map((x) => ({ id: x.id, name: x.name, count: x._count.interviews })),
    };
  },
  ["coverage-gaps"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);

// ============ TRENDS ============

export const getYearlyTopicAreaDistribution = unstable_cache(
  async () => {
    const rows = await prisma.$queryRaw<{ year: number; topicAreaName: string; count: bigint }[]>`
      SELECT
        i.year AS year,
        ta.name AS "topicAreaName",
        COUNT(tc.id) AS count
      FROM "Interview" i
      JOIN "Round" r ON r."interviewId" = i.id
      JOIN "TopicCoverage" tc ON tc."roundId" = r.id
      JOIN "TopicArea" ta ON tc."topicAreaId" = ta.id
      GROUP BY i.year, ta.name
      ORDER BY i.year ASC, ta.name ASC;
    `;
    return rows.map((r) => ({
      year: Number(r.year),
      topicAreaName: r.topicAreaName,
      count: Number(r.count),
    }));
  },
  ["yearly-topic-area-distribution"],
  { revalidate: CACHE_TTL, tags: [TAG] }
);
