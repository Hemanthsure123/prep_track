import { z } from "zod";

import { slugify } from "@/lib/slug";

export const companyCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters/numbers separated by single hyphens.",
    ),
  logoUrl: z.string().url().nullish(),
  websiteUrl: z.string().url().nullish(),
  description: z.string().trim().max(2000).nullish(),
});

export type CompanyCreate = z.infer<typeof companyCreateSchema>;

export const companyCreateOrPickSchema = z.union([
  z.object({
    mode: z.literal("existing"),
    companyId: z.string().min(1, "Pick a company."),
  }),
  z.object({
    mode: z.literal("new"),
    data: companyCreateSchema.transform((c) => ({
      ...c,
      slug: c.slug || slugify(c.name),
    })),
  }),
]);

export type CompanyCreateOrPick = z.infer<typeof companyCreateOrPickSchema>;
