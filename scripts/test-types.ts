import { prisma } from "../lib/db";

async function main() {
  console.log("Inspecting type of submissions timeline queryRaw...");
  try {
    const since = new Date(Date.now() - 26 * 7 * 24 * 60 * 60 * 1000);
    const rows = await prisma.$queryRaw<{ week: unknown; count: bigint }[]>`
      SELECT date_trunc('week', "publishedAt") AS week, COUNT(*) AS count
      FROM "Interview"
      WHERE "publishedAt" >= ${since}
      GROUP BY week
      ORDER BY week ASC;
    `;
    
    if (rows.length > 0) {
      const firstRow = rows[0];
      console.log("Raw row:", firstRow);
      console.log("Type of 'week' property:", typeof firstRow.week);
      console.log("Is Date instance:", firstRow.week instanceof Date);

      try {
        const formattedDirect = (firstRow.week as Date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        console.log("Formatted directly:", formattedDirect);
      } catch (e: unknown) {
        console.error("Direct format failed:", e instanceof Error ? e.message : String(e));
      }

      try {
        const formattedSafe = new Date(firstRow.week as string | number | Date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        console.log("Formatted safely:", formattedSafe);
      } catch (e: unknown) {
        console.error("Safe format failed:", e instanceof Error ? e.message : String(e));
      }
    } else {
      console.log("No data returned to inspect.");
    }
  } catch (err) {
    console.error("Script execution failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
