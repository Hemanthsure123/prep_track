import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url),
    );
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Ensure Prisma User row exists for OAuth-created Supabase users.
  let dbUser = await prisma.user.findUnique({
    where: { email: authUser.email },
  });

  if (!dbUser) {
    const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
    const name =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : null;
    const avatarUrl =
      typeof metadata.avatar_url === "string"
        ? metadata.avatar_url
        : typeof metadata.picture === "string"
          ? metadata.picture
          : null;

    dbUser = await prisma.user.create({
      data: {
        email: authUser.email,
        name,
        avatarUrl,
        role: "STUDENT",
      },
    });
  }

  // Force onboarding for new accounts.
  if (!dbUser.onboardedAt) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.redirect(new URL(next, req.url));
}
