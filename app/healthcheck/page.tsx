import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Healthcheck | Interview Experience Platform",
};

export const dynamic = "force-dynamic";

export default async function HealthcheckPage() {
  const row = await prisma.healthCheck.findFirst({
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Pipeline healthcheck</CardTitle>
          <CardDescription>
            Next.js → Prisma → Supabase Postgres roundtrip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {row ? (
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Label</dt>
                <dd className="font-mono">{row.label}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Created at</dt>
                <dd className="font-mono">{row.createdAt.toISOString()}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Row id</dt>
                <dd className="font-mono">{row.id}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-destructive text-sm">
              No HealthCheck row found. Seed the DB first:{" "}
              <code className="font-mono">npx prisma db seed</code>.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
