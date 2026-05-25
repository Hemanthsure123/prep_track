import { Prisma } from "@prisma/client";

import { slugify } from "@/lib/slug";
import {
  InterviewFullCreate,
  WizardAsset,
} from "@/lib/validations/interview-full";

export class InterviewWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InterviewWriteError";
  }
}

export async function resolveCompanyId(
  tx: Prisma.TransactionClient,
  company: InterviewFullCreate["company"],
): Promise<string> {
  if (company.mode === "existing") {
    const row = await tx.company.findUnique({
      where: { id: company.companyId },
      select: { id: true },
    });
    if (!row) {
      throw new InterviewWriteError(
        `Unknown company id: ${company.companyId}`,
      );
    }
    return row.id;
  }

  const slug = company.data.slug || slugify(company.data.name);
  const upserted = await tx.company.upsert({
    where: { slug },
    update: {},
    create: {
      name: company.data.name,
      slug,
      logoUrl: company.data.logoUrl ?? null,
      websiteUrl: company.data.websiteUrl ?? null,
      description: company.data.description ?? null,
    },
    select: { id: true },
  });
  return upserted.id;
}

function assetsForRound(
  assets: ReadonlyArray<WizardAsset>,
  roundIndex: number,
): Prisma.AssetCreateWithoutRoundInput[] {
  return assets
    .filter((a) => a.scope === "round" && a.roundIndex === roundIndex)
    .map((a) => ({
      kind: a.kind,
      url: a.url,
      label: a.label ?? null,
    }));
}

function interviewLevelAssets(
  assets: ReadonlyArray<WizardAsset>,
): Prisma.AssetCreateWithoutInterviewInput[] {
  return assets
    .filter((a) => a.scope === "interview")
    .map((a) => ({
      kind: a.kind,
      url: a.url,
      label: a.label ?? null,
    }));
}

function buildRoundsCreate(
  payload: InterviewFullCreate,
): Prisma.RoundCreateWithoutInterviewInput[] {
  return payload.rounds.map((r, roundIndex) => ({
    roundNumber: roundIndex + 1,
    roundName: r.roundName,
    roundType: r.roundType,
    durationMinutes: r.durationMinutes ?? null,
    mode: r.mode,
    numInterviewers: r.numInterviewers ?? null,
    interviewStyle: r.interviewStyle ?? null,
    outcome: r.outcome,
    keyLearnings: r.keyLearnings ?? null,
    questions: {
      create: r.questions.map((q, questionIndex) => ({
        orderIndex: questionIndex,
        title: q.title,
        statement: q.statement,
        category: q.category,
        difficulty: q.difficulty,
        approach: q.approach ?? null,
        timeGivenMin: q.timeGivenMin ?? null,
        timeTakenMin: q.timeTakenMin ?? null,
        solvedStatus: q.solvedStatus ?? null,
        followUps: q.followUps,
        referenceUrl: q.referenceUrl ?? null,
        topics: {
          create: q.topicIds.map((topicId) => ({ topicId })),
        },
      })),
    },
    assets: { create: assetsForRound(payload.assets, roundIndex) },
  }));
}

function interviewCoreData(
  payload: InterviewFullCreate,
  companyId: string,
  userId: string,
) {
  return {
    company: { connect: { id: companyId } },
    createdBy: { connect: { id: userId } },
    role: payload.interview.role,
    roleLevel: payload.interview.roleLevel,
    year: payload.interview.year,
    season: payload.interview.season,
    isOnCampus: payload.interview.isOnCampus,
    source: payload.interview.source ?? null,
    cgpaCutoff: payload.interview.cgpaCutoff ?? null,
    totalSelected: payload.interview.totalSelected ?? null,
    candidateCgpa: payload.interview.candidateCgpa ?? null,
    candidateBranch: payload.interview.candidateBranch ?? null,
    candidateGradYear: payload.interview.candidateGradYear ?? null,
    candidateBackground: payload.interview.candidateBackground ?? null,
    finalOutcome: payload.interview.finalOutcome,
    biggestTip: payload.interview.biggestTip ?? null,
  } satisfies Omit<
    Prisma.InterviewCreateInput,
    "rounds" | "assets" | "bookmarks"
  >;
}

export async function createInterviewTree(
  tx: Prisma.TransactionClient,
  userId: string,
  payload: InterviewFullCreate,
): Promise<{ id: string }> {
  const companyId = await resolveCompanyId(tx, payload.company);

  const created = await tx.interview.create({
    data: {
      ...interviewCoreData(payload, companyId, userId),
      rounds: { create: buildRoundsCreate(payload) },
      assets: { create: interviewLevelAssets(payload.assets) },
    },
    select: { id: true },
  });

  return created;
}

export async function replaceInterviewTree(
  tx: Prisma.TransactionClient,
  id: string,
  userId: string,
  payload: InterviewFullCreate,
): Promise<void> {
  const companyId = await resolveCompanyId(tx, payload.company);

  // Cascade is configured Round -> Interview, Question -> Round, and
  // QuestionTopic -> Question, so deleting the rounds wipes the entire
  // nested tree (questions, question-topic joins, and round-level assets).
  await tx.round.deleteMany({ where: { interviewId: id } });
  await tx.asset.deleteMany({ where: { interviewId: id } });

  await tx.interview.update({
    where: { id },
    data: {
      ...interviewCoreData(payload, companyId, userId),
      rounds: { create: buildRoundsCreate(payload) },
      assets: { create: interviewLevelAssets(payload.assets) },
    },
  });
}
