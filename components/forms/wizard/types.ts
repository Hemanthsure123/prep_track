import type { QuestionCategory } from "@prisma/client";

import type { InterviewFullCreate } from "@/lib/validations/interview-full";

export type WizardMode = "create" | "edit";

export type CompanyOption = {
  id: string;
  name: string;
  slug: string;
};

export type TopicOption = {
  id: string;
  name: string;
  slug: string;
  category: QuestionCategory;
};

export type WizardValues = InterviewFullCreate;

export const TOTAL_STEPS = 4;
export type WizardStep = 1 | 2 | 3 | 4;

export const STEP_TITLES: Record<WizardStep, string> = {
  1: "Interview metadata",
  2: "Rounds",
  3: "Questions",
  4: "Assets & review",
};

export function makeEmptyRound(): WizardValues["rounds"][number] {
  return {
    roundNumber: 1,
    roundName: "",
    roundType: "TECHNICAL_1",
    durationMinutes: null,
    mode: "ONLINE",
    numInterviewers: null,
    interviewStyle: null,
    outcome: "CLEARED",
    keyLearnings: null,
    questions: [],
  };
}

export function makeEmptyQuestion(): WizardValues["rounds"][number]["questions"][number] {
  return {
    orderIndex: 0,
    title: "",
    statement: "",
    category: "DSA",
    difficulty: "MEDIUM",
    approach: null,
    timeGivenMin: null,
    timeTakenMin: null,
    solvedStatus: null,
    followUps: [],
    referenceUrl: null,
    topicIds: [],
  };
}

export function makeEmptyValues(): WizardValues {
  return {
    company: { mode: "existing", companyId: "" },
    interview: {
      role: "",
      roleLevel: "INTERN",
      year: new Date().getUTCFullYear(),
      season: "SUMMER",
      isOnCampus: true,
      source: null,
      cgpaCutoff: null,
      totalSelected: null,
      candidateCgpa: null,
      candidateBranch: null,
      candidateGradYear: null,
      candidateBackground: null,
      finalOutcome: "SELECTED",
      biggestTip: null,
    },
    rounds: [makeEmptyRound()],
    assets: [],
  };
}
