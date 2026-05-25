import { User, UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentDbUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  return prisma.user.findUnique({ where: { email: authUser.email } });
}

export async function requireSignedIn(): Promise<User> {
  const user = await getCurrentDbUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireAdminOrPanelist(): Promise<User> {
  const user = await requireSignedIn();
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.PANELIST) {
    throw new ForbiddenError(
      "Only admins and panelists can perform this action.",
    );
  }
  return user;
}
