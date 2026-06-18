import { prisma } from "../lib/db";

async function main() {
  console.log("Running raw DB queries directly...");
  try {
    console.log("1. KPI overview counts...");
    const kpis = await Promise.all([
      prisma.interview.count(),
      prisma.round.count(),
      prisma.topicCoverage.count(),
      prisma.subTopicEntry.count(),
      prisma.company.count(),
      prisma.subTopic.count(),
    ]);
    console.log("Success! counts:", kpis);

    console.log("2. Top subtopics findMany...");
    const subtopics = await prisma.subTopic.findMany({
      take: 10,
      include: {
        topicArea: { select: { name: true } },
        _count: { select: { entries: true } },
      },
      orderBy: { entries: { _count: "desc" } },
    });
    console.log("Success! subtopics:", subtopics.length);

    console.log("3. Submissions timeline queryRaw...");
    const since = new Date(Date.now() - 26 * 7 * 24 * 60 * 60 * 1000);
    const subs = await prisma.$queryRaw`
      SELECT date_trunc('week', "publishedAt") AS week, COUNT(*) AS count
      FROM "Interview"
      WHERE "publishedAt" >= ${since}
      GROUP BY week
      ORDER BY week ASC;
    `;
    console.log("Success! subs:", (subs as unknown[]).length);

    console.log("4. Heatmap queryRaw...");
    const heatmap = await prisma.$queryRaw`
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
    console.log("Success! heatmap:", (heatmap as unknown[]).length);

    console.log("5. Company topic profile queryRaw...");
    const companies = await prisma.company.findMany({ take: 2, select: { id: true } });
    const companyIds = companies.map((c) => c.id);
    if (companyIds.length > 0) {
      const profile = await prisma.$queryRaw`
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
      console.log("Success! company profile:", (profile as unknown[]).length);
    } else {
      console.log("Skipping company profile (no companies in database)");
    }

    console.log("6. Role level topic profile queryRaw...");
    const roleProfile = await prisma.$queryRaw`
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
    console.log("Success! role profile:", (roleProfile as unknown[]).length);

    console.log("7. Gaps counts findMany...");
    const thinTopicAreas = await prisma.topicArea.findMany({
      orderBy: { topicCoverages: { _count: "asc" } },
      include: { _count: { select: { topicCoverages: true } } },
    });
    console.log("Success! gaps:", thinTopicAreas.length);

    console.log("8. Yearly topic area distribution queryRaw...");
    const yearly = await prisma.$queryRaw`
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
    console.log("Success! yearly:", (yearly as unknown[]).length);

    console.log("🎉 ALL RAW QUERIES RUN SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ RAW DB QUERY FAILURE DETECTED:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
