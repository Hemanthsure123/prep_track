import { z } from "zod";

import { companyCreateOrPickSchema } from "@/lib/validations/company";
import { interviewCreateSchema } from "@/lib/validations/interview";
import { questionCreateSchema } from "@/lib/validations/question";
import { roundCreateSchema } from "@/lib/validations/round";

const roundWithQuestionsSchema = roundCreateSchema.extend({
  questions: z
    .array(questionCreateSchema)
    .min(1, "Each round needs at least one question.")
    .max(50, "At most 50 questions per round."),
});

export const interviewFullCreateSchema = z.object({
  company: companyCreateOrPickSchema,
  interview: interviewCreateSchema.omit({ companyId: true }),
  rounds: z
    .array(roundWithQuestionsSchema)
    .min(1, "At least one round is required.")
    .max(15, "At most 15 rounds."),
});

export type InterviewFullCreate = z.infer<typeof interviewFullCreateSchema>;
