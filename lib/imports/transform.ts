import type { LlmExtraction } from "@/lib/ai/extraction";
import type {
  SubTopicOption,
  TopicAreaOption,
  WizardValues,
} from "@/components/forms/wizard/types";

type RawCsvRow = Record<string, string | undefined | null>;

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export type TransformResult = {
  values: WizardValues;
  unresolvedTopicAreas: string[];
  newSubTopicNames: { topicAreaName: string; subTopicName: string }[];
};

/**
 * Convert an LLM extraction + the raw CSV row into the wizard's expected
 * InterviewFullCreateInput shape. Sub-topics that don't exist in this topic
 * area become `__new__` sentinels (same convention the manual wizard uses for
 * inline creates), so they can be confirmed at approve time.
 *
 * Unmatched topic areas remain unresolved — the review UI must surface them.
 */
export function transformExtractionToWizardValues(
  raw: RawCsvRow,
  llm: LlmExtraction,
  topicAreas: TopicAreaOption[],
  subTopics: SubTopicOption[],
  options: {
    companyId?: string; // matched existing company, if found
    roleLevelId?: string; // matched existing role level, if found
  } = {},
): TransformResult {
  const topicAreaByName = new Map(
    topicAreas.map((ta) => [normalize(ta.name), ta]),
  );

  const unresolvedTopicAreas = new Set<string>();
  const newSubTopicNames: TransformResult["newSubTopicNames"] = [];

  const roleLevelName = (raw.role_level ?? "").trim();
  const companyName = (raw.company_name ?? "").trim();

  const rounds: WizardValues["rounds"] = llm.rounds.map((r, rIdx) => {
    const topicCoverages = r.topicCoverages.map((cov, covIdx) => {
      const matchedArea = topicAreaByName.get(normalize(cov.topicAreaName));
      if (!matchedArea) unresolvedTopicAreas.add(cov.topicAreaName);

      const topicAreaId = matchedArea?.id ?? "";

      const entries = cov.entries.map((e, eIdx) => {
        const inThisArea = matchedArea
          ? subTopics.filter((st) => st.topicAreaId === matchedArea.id)
          : [];
        const matchedSt = inThisArea.find(
          (st) => normalize(st.name) === normalize(e.subTopicName),
        );
        if (!matchedSt) {
          newSubTopicNames.push({
            topicAreaName: matchedArea?.name ?? cov.topicAreaName,
            subTopicName: e.subTopicName,
          });
        }
        return {
          subTopicId: matchedSt?.id ?? "__new__",
          subTopicName: e.subTopicName,
          orderIndex: eIdx,
          exactQuestionText: e.exactQuestionText ?? "",
          referenceUrl: e.referenceUrl ?? "",
        };
      });

      return {
        topicAreaId,
        subTopicCount: entries.length,
        orderIndex: covIdx,
        entries,
      };
    });

    return {
      roundNumber: r.roundNumber ?? rIdx + 1,
      roundName: r.roundName,
      roundType: r.roundType,
      durationMinutes: r.durationMinutes ?? null,
      mode: r.mode,
      numInterviewers: null,
      interviewStyle: r.interviewStyle ?? null,
      outcome: r.outcome,
      keyLearnings: r.keyLearnings ?? null,
      topicCoverages,
    };
  });

  const yearRaw = Number(raw.year);
  const year = Number.isFinite(yearRaw) && yearRaw > 0
    ? yearRaw
    : new Date().getUTCFullYear();

  const totalSelectedRaw = Number(raw.total_selected);
  const totalSelected =
    Number.isFinite(totalSelectedRaw) && totalSelectedRaw > 0
      ? totalSelectedRaw
      : null;

  const values: WizardValues = {
    company: options.companyId
      ? { mode: "existing", companyId: options.companyId }
      : {
          mode: "new",
          data: {
            name: companyName,
            slug: companyName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
            logoUrl: null,
            websiteUrl: null,
            description: null,
          },
        },
    interview: {
      role: (raw.role ?? "").trim() || "(unknown)",
      roleLevelId: options.roleLevelId ?? "__new__",
      roleLevelName: roleLevelName,
      year,
      totalSelected,
      biggestTip: (raw.biggest_tip ?? "").trim() || null,
    },
    rounds,
    assets: [],
  };

  return {
    values,
    unresolvedTopicAreas: Array.from(unresolvedTopicAreas),
    newSubTopicNames,
  };
}
