import { z } from "zod";

import { assetKindSchema } from "@/lib/validations/asset";
import { companyCreateOrPickSchema } from "@/lib/validations/company";
import { interviewBaseSchema } from "@/lib/validations/interview";
import { roundCreateSchema } from "@/lib/validations/round";
import { topicCoverageCreateSchema } from "@/lib/validations/topic-coverage";

const roundWithTopicCoveragesSchema = roundCreateSchema.extend({
  topicCoverages: z
    .array(topicCoverageCreateSchema)
    .max(50, "At most 50 topic coverages per round."),
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

export const interviewFullCreateSchema = z
  .object({
    company: companyCreateOrPickSchema,
    interview: interviewBaseSchema.omit({ companyId: true }),
    rounds: z
      .array(roundWithTopicCoveragesSchema)
      .min(1, "At least one round is required.")
      .max(15, "At most 15 rounds."),
    assets: z.array(wizardAssetSchema).max(50),
  })
  .refine(
    (data) => {
      if (data.interview.roleLevelId === "__new__") {
        return !!data.interview.roleLevelName?.trim();
      }
      return true;
    },
    {
      message: "Specify a custom role level name.",
      path: ["interview", "roleLevelName"],
    },
  );

export type InterviewFullCreate = z.infer<typeof interviewFullCreateSchema>;
