import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin | Interview Experience Platform",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {user.email}.</CardTitle>
        <CardDescription>You are an authenticated user.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="text-muted-foreground">
          Diagnostics:{" "}
          <Link href="/admin/db-check" className="underline">
            /admin/db-check
          </Link>{" "}
          — verifies every Prisma model is queryable and the storage bucket is
          reachable.
        </p>
      </CardContent>
    </Card>
  );
}
