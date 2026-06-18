"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";

const BRANCHES = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "CHEM",
  "AI_ML",
  "OTHER",
] as const;

const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(100),
  branch: z.enum(BRANCHES).optional(),
  gradYear: z.coerce.number().int().min(2000).max(2035).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(input: OnboardingInput) {
  const user = await requireUser();
  const data = onboardingSchema.parse(input);
  await prisma.user.update({
    where: { id: user.id },
    data: { ...data, onboardedAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true } as const;
}

const profileSchema = onboardingSchema.partial();
export type ProfileUpdateInput = z.infer<typeof profileSchema>;

export async function updateProfile(input: ProfileUpdateInput) {
  const user = await requireUser();
  const data = profileSchema.parse(input);
  await prisma.user.update({ where: { id: user.id }, data });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
