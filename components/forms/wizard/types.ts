import type { InterviewFullCreate } from "@/lib/validations/interview-full";

export type WizardMode = "create" | "edit" | "import-review";

export type CompanyOption = {
  id: string;
  name: string;
  slug: string;
};

export type TopicAreaOption = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type SubTopicOption = {
  id: string;
  name: string;
  slug: string;
  topicAreaId: string;
};

export type RoleLevelOption = {
  id: string;
  name: string;
  slug: string;
};

export type WizardValues = InterviewFullCreate;

export const TOTAL_STEPS = 4;
export type WizardStep = 1 | 2 | 3 | 4;

export const STEP_TITLES: Record<WizardStep, string> = {
  1: "Interview metadata",
  2: "Rounds",
  3: "Topic Coverage",
  4: "Assets & review",
};

export function makeEmptySubTopicEntry(orderIndex = 0): WizardValues["rounds"][number]["topicCoverages"][number]["entries"][number] {
  return {
    subTopicId: "",
    subTopicName: "",
    orderIndex,
    exactQuestionText: "",
    referenceUrl: "",
  };
}

export function makeEmptyTopicCoverage(orderIndex = 0): WizardValues["rounds"][number]["topicCoverages"][number] {
  return {
    topicAreaId: "",
    subTopicCount: 0,
    orderIndex,
    entries: [],
  };
}

export function makeEmptyRound(roundNumber = 1): WizardValues["rounds"][number] {
  return {
    roundNumber,
    roundName: "",
    roundType: "TECHNICAL_1",
    durationMinutes: null,
    mode: "ONLINE",
    numInterviewers: null,
    interviewStyle: null,
    outcome: "CLEARED",
    keyLearnings: null,
    topicCoverages: [],
  };
}

export function makeEmptyValues(): WizardValues {
  return {
    company: { mode: "existing", companyId: "" },
    interview: {
      role: "",
      roleLevelId: "",
      roleLevelName: "",
      year: new Date().getUTCFullYear(),
      totalSelected: null,
      biggestTip: null,
    },
    rounds: [makeEmptyRound(1)],
    assets: [],
  };
}
