import {
  getOverviewKpis,
  getTopSubTopics,
  getTopicAreaFrequency,
  getSubmissionsOverTime,
  getTopCompaniesByInterviewCount,
  getCoverageHeatmap,
  getRoleLevelTopicProfile,
  getCoverageGaps,
  getYearlyTopicAreaDistribution,
} from "../lib/analytics/queries";

async function main() {
  console.log("Running analytics queries in isolation...");
  try {
    console.log("1. getOverviewKpis...");
    const kpis = await getOverviewKpis();
    console.log("Success! KPIs:", kpis);

    console.log("2. getTopSubTopics...");
    const subtopics = await getTopSubTopics();
    console.log("Success! Subtopics count:", subtopics.length);

    console.log("3. getTopicAreaFrequency...");
    const freq = await getTopicAreaFrequency();
    console.log("Success! Frequency count:", freq.length);

    console.log("4. getSubmissionsOverTime...");
    const subs = await getSubmissionsOverTime();
    console.log("Success! Submissions count:", subs.length);

    console.log("5. getTopCompaniesByInterviewCount...");
    const comps = await getTopCompaniesByInterviewCount();
    console.log("Success! Companies count:", comps.length);

    console.log("6. getCoverageHeatmap...");
    const heatmap = await getCoverageHeatmap();
    console.log("Success! Heatmap count:", heatmap.length);

    console.log("7. getRoleLevelTopicProfile...");
    const roles = await getRoleLevelTopicProfile();
    console.log("Success! Roles count:", roles.length);

    console.log("8. getCoverageGaps...");
    const gaps = await getCoverageGaps();
    console.log("Success! Gaps thinTopicAreas:", gaps.thinTopicAreas.length);

    console.log("9. getYearlyTopicAreaDistribution...");
    const yoy = await getYearlyTopicAreaDistribution();
    console.log("Success! YoY count:", yoy.length);

    console.log("🎉 ALL QUERIES PASSED IN ISOLATION!");
  } catch (err) {
    console.error("❌ QUERY FAILURE DETECTED:");
    console.error(err);
  }
}

main();
