import { PrismaClient, UserRole } from "@prisma/client";

import {
  createInterviewTree,
  replaceInterviewTree,
} from "../lib/interview/write";
import {
  InterviewFullCreate,
  interviewFullCreateSchema,
} from "../lib/validations/interview-full";

const prisma = new PrismaClient();

async function ensureTestUser(): Promise<{ id: string; email: string }> {
  const email = "test-create@example.com";
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.PANELIST },
    create: { email, name: "Test Create Script", role: UserRole.PANELIST },
    select: { id: true, email: true },
  });
  return user;
}

async function pickAnyTopic(category: "DSA"): Promise<string> {
  const row = await prisma.topic.findFirst({
    where: { category },
    select: { id: true },
  });
  if (!row) throw new Error(`No topics seeded for ${category}.`);
  return row.id;
}

async function pickGoogleCompanyId(): Promise<string> {
  const c = await prisma.company.findUnique({
    where: { slug: "google" },
    select: { id: true },
  });
  if (!c) throw new Error("Seed expected 'google' company.");
  return c.id;
}

async function buildPayload(): Promise<InterviewFullCreate> {
  const [companyId, dsaTopicId] = await Promise.all([
    pickGoogleCompanyId(),
    pickAnyTopic("DSA"),
  ]);

  const raw: InterviewFullCreate = {
    company: { mode: "existing", companyId },
    interview: {
      role: "Software Engineer Intern",
      roleLevel: "INTERN",
      year: 2025,
      season: "SUMMER",
      isOnCampus: true,
      source: "Campus drive",
      cgpaCutoff: 7.5,
      totalSelected: 4,
      candidateCgpa: 8.6,
      candidateBranch: "CSE",
      candidateGradYear: 2026,
      candidateBackground: "Two SDE internships; LeetCode 400+.",
      finalOutcome: "SELECTED",
      biggestTip: "Think aloud and clarify assumptions before coding.",
    },
    rounds: [
      {
        roundNumber: 1,
        roundName: "Online Assessment",
        roundType: "ONLINE_ASSESSMENT",
        durationMinutes: 90,
        mode: "CODING_PLATFORM",
        numInterviewers: 0,
        interviewStyle: null,
        outcome: "CLEARED",
        keyLearnings: "Practice 2-pointer and sliding window patterns.",
        questions: [
          {
            orderIndex: 0,
            title: "Reorder array by parity",
            statement: "Given an array, rearrange so evens come before odds.",
            category: "DSA",
            difficulty: "EASY",
            approach: "Two-pointer swap in place.",
            timeGivenMin: 30,
            timeTakenMin: 12,
            solvedStatus: "SOLVED",
            followUps: ["What if we need stable order?"],
            referenceUrl: null,
            topicIds: [dsaTopicId],
          },
        ],
      },
      {
        roundNumber: 2,
        roundName: "Tech 1",
        roundType: "TECHNICAL_1",
        durationMinutes: 45,
        mode: "ONLINE",
        numInterviewers: 1,
        interviewStyle: "Friendly, collaborative",
        outcome: "CLEARED",
        keyLearnings: null,
        questions: [],
      },
    ],
    assets: [
      {
        scope: "interview",
        roundIndex: null,
        kind: "external_link",
        path: null,
        url: "https://leetcode.com/problemset/all/",
        label: "LeetCode list",
      },
    ],
  };

  // Round-trip through Zod so we catch shape drift early.
  return interviewFullCreateSchema.parse(raw);
}

async function main() {
  const user = await ensureTestUser();
  const payload = await buildPayload();

  console.log("Creating interview tree...");
  const created = await prisma.$transaction((tx) =>
    createInterviewTree(tx, user.id, payload),
  );
  console.log("  created:", created.id);

  const fetched = await prisma.interview.findUnique({
    where: { id: created.id },
    include: {
      company: { select: { name: true } },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
            include: { topics: { include: { topic: true } } },
          },
        },
      },
      assets: true,
    },
  });

  if (!fetched) throw new Error("Could not refetch created interview.");

  console.log(
    `  → company=${fetched.company.name}, role=${fetched.role}, ` +
      `rounds=${fetched.rounds.length}, ` +
      `questions=${fetched.rounds.reduce((s, r) => s + r.questions.length, 0)}, ` +
      `topics=${fetched.rounds.reduce(
        (s, r) =>
          s + r.questions.reduce((q, qq) => q + qq.topics.length, 0),
        0,
      )}, assets=${fetched.assets.length}`,
  );

  console.log("Replacing interview tree (role rename + drop one round)...");
  const updatedPayload: InterviewFullCreate = {
    ...payload,
    interview: { ...payload.interview, role: "SDE Intern (renamed)" },
    rounds: payload.rounds.slice(0, 1),
  };
  await prisma.$transaction((tx) =>
    replaceInterviewTree(tx, created.id, user.id, updatedPayload),
  );

  const after = await prisma.interview.findUnique({
    where: { id: created.id },
    include: { rounds: true, assets: true },
  });
  if (!after) throw new Error("Lost interview after replace.");
  console.log(
    `  → role=${after.role}, rounds=${after.rounds.length}, ` +
      `assets=${after.assets.length}`,
  );

  if (after.role !== "SDE Intern (renamed)") {
    throw new Error("Replace did not update role.");
  }
  if (after.rounds.length !== 1) {
    throw new Error("Replace did not drop the second round.");
  }

  console.log("Deleting interview...");
  await prisma.interview.delete({ where: { id: created.id } });

  const gone = await prisma.interview.findUnique({
    where: { id: created.id },
  });
  if (gone) throw new Error("Delete failed.");

  console.log("OK — create/replace/delete cycle works end-to-end.");
}

main()
  .catch((err) => {
    console.error("test-create failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
