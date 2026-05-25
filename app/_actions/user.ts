"use server";

import { z } from "zod";

import { prisma } from "@/lib/db";

const createUserProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(120).optional(),
});

export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;

export async function createUserProfile(input: CreateUserProfileInput) {
  const parsed = createUserProfileSchema.parse(input);

  return prisma.user.upsert({
    where: { email: parsed.email },
    update: parsed.name ? { name: parsed.name } : {},
    create: {
      email: parsed.email,
      name: parsed.name,
    },
    select: { id: true, email: true, role: true },
  });
}
