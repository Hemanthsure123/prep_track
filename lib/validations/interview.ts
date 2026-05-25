import {
  Branch,
  FinalOutcome,
  RoleLevel,
  Season,
} from "@prisma/client";
import { z } from "zod";

const currentYear = new Date().getUTCFullYear();
const MIN_YEAR = 2000;
const MAX_YEAR = currentYear + 1;

const cgpa = z.number().min(0).max(10);

export const interviewCreateSchema = z.object({
  companyId: z.string().min(1, "Company is required."),

  role: z.string().trim().min(1, "Role is required.").max(120),
  roleLevel: z.nativeEnum(RoleLevel),
  year: z
    .number()
    .int()
    .min(MIN_YEAR, `Year must be ${MIN_YEAR} or later.`)
    .max(MAX_YEAR, `Year cannot exceed ${MAX_YEAR}.`),
  season: z.nativeEnum(Season),
  isOnCampus: z.boolean(),
  source: z.string().trim().max(200).nullish(),
  cgpaCutoff: cgpa.nullish(),
  totalSelected: z.number().int().min(0).nullish(),

  candidateCgpa: cgpa.nullish(),
  candidateBranch: z.nativeEnum(Branch).nullish(),
  candidateGradYear: z.number().int().min(MIN_YEAR).max(MAX_YEAR + 5).nullish(),
  candidateBackground: z.string().trim().max(2000).nullish(),

  finalOutcome: z.nativeEnum(FinalOutcome),
  biggestTip: z.string().trim().max(2000).nullish(),
});

export type InterviewCreate = z.infer<typeof interviewCreateSchema>;
