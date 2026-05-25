import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.healthCheck.findFirst({
    where: { label: "pipeline-ok" },
  });

  if (existing) {
    return existing;
  }

  return prisma.healthCheck.create({
    data: { label: "pipeline-ok" },
  });
}

main()
  .then((row) => {
    process.stdout.write(`Seeded HealthCheck row: ${row.id}\n`);
  })
  .catch((err) => {
    process.stderr.write(`Seed failed: ${String(err)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
