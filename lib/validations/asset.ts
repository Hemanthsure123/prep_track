import { z } from "zod";

export const assetKindSchema = z.enum([
  "prep_pdf",
  "infographic_pdf",
  "external_link",
]);

export type AssetKind = z.infer<typeof assetKindSchema>;

export const assetCreateSchema = z
  .object({
    interviewId: z.string().min(1).nullish(),
    roundId: z.string().min(1).nullish(),
    kind: assetKindSchema,
    url: z.string().url("Provide a valid URL."),
    label: z.string().trim().max(200).nullish(),
  })
  .refine(
    (a) => Boolean(a.interviewId) || Boolean(a.roundId),
    "An asset must be linked to either an interview or a round.",
  )
  .refine(
    (a) => !(a.interviewId && a.roundId),
    "An asset cannot be linked to both an interview and a round.",
  );

export type AssetCreate = z.infer<typeof assetCreateSchema>;
