import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ForbiddenError, requireAdminOrPanelist } from "@/lib/auth/guards";

import { NewInterviewClient } from "./new-interview-client";

export const metadata = {
  title: "New interview | Admin",
};

export const dynamic = "force-dynamic";

export default async function NewInterviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    await requireAdminOrPanelist();
  } catch (err) {
    if (err instanceof ForbiddenError) redirect("/admin");
    throw err;
  }

  const [companies, topics] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.topic.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, category: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">New interview</h1>
        <p className="text-muted-foreground text-sm">
          Capture a full interview process. Drafts autosave to your browser.
        </p>
      </header>
      <NewInterviewClient companies={companies} topics={topics} />
    </div>
  );
}
