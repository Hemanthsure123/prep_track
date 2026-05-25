import { Difficulty, QuestionCategory, SolvedStatus } from "@prisma/client";
import { z } from "zod";

export const questionCreateSchema = z.object({
  orderIndex: z
    .number()
    .int()
    .min(0, "orderIndex must be 0 or greater."),
  title: z.string().trim().min(1, "Title is required.").max(200),
  statement: z.string().trim().min(1, "Statement is required.").max(8000),
  category: z.nativeEnum(QuestionCategory),
  difficulty: z.nativeEnum(Difficulty),
  approach: z.string().trim().max(8000).nullish(),
  timeGivenMin: z.number().int().min(0).max(24 * 60).nullish(),
  timeTakenMin: z.number().int().min(0).max(24 * 60).nullish(),
  solvedStatus: z.nativeEnum(SolvedStatus).nullish(),
  followUps: z.array(z.string().trim().min(1).max(1000)).default([]),
  referenceUrl: z.string().url().nullish(),
  topicIds: z
    .array(z.string().min(1))
    .min(1, "Pick at least one topic.")
    .max(20, "At most 20 topics per question."),
});

export type QuestionCreate = z.infer<typeof questionCreateSchema>;
