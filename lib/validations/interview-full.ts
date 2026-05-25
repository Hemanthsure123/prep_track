import { z } from "zod";

import { assetKindSchema } from "@/lib/validations/asset";
import { companyCreateOrPickSchema } from "@/lib/validations/company";
import { interviewCreateSchema } from "@/lib/validations/interview";
import { questionCreateSchema } from "@/lib/validations/question";
import { roundCreateSchema } from "@/lib/validations/round";

const roundWithQuestionsSchema = roundCreateSchema.extend({
  questions: z
    .array(questionCreateSchema)
    .max(50, "At most 50 questions per round."),
});

export const wizardAssetSchema = z.object({
  scope: z.enum(["interview", "round"]),
  roundIndex: z.number().int().min(0).nullish(),
  kind: assetKindSchema,
  path: z.string().min(1).nullish(),
  url: z.string().url("Provide a valid URL."),
  label: z.string().trim().max(200).nullish(),
});

export type WizardAsset = z.infer<typeof wizardAssetSchema>;

export const interviewFullCreateSchema = z.object({
  company: companyCreateOrPickSchema,
  interview: interviewCreateSchema.omit({ companyId: true }),
  rounds: z
    .array(roundWithQuestionsSchema)
    .min(1, "At least one round is required.")
    .max(15, "At most 15 rounds."),
  assets: z.array(wizardAssetSchema).max(50),
});

export type InterviewFullCreate = z.infer<typeof interviewFullCreateSchema>;
