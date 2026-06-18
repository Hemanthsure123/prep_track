import { z } from "zod";

const currentYear = new Date().getUTCFullYear();
const MIN_YEAR = 2000;
const MAX_YEAR = currentYear + 1;

export const interviewBaseSchema = z.object({
  companyId: z.string().min(1, "Company is required."),
  role: z.string().trim().min(1, "Role is required.").max(120),
  roleLevelId: z.string().min(1, "Role level is required."),
  roleLevelName: z.string().trim().optional(),
  year: z
    .number()
    .int()
    .min(MIN_YEAR, `Year must be ${MIN_YEAR} or later.`)
    .max(MAX_YEAR, `Year cannot exceed ${MAX_YEAR}.`),
  totalSelected: z.number().int().min(0).nullish(),
  biggestTip: z.string().trim().max(2000).nullish(),
});

export const interviewCreateSchema = interviewBaseSchema.refine(
  (data) => {
    if (data.roleLevelId === "__new__") {
      return !!data.roleLevelName?.trim();
    }
    return true;
  },
  {
    message: "Specify a custom role level name.",
    path: ["roleLevelName"],
  },
);

export type InterviewCreate = z.infer<typeof interviewCreateSchema>;
