import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  const interviews = await prisma.interview.findMany({
    include: { company: true }
  });
  console.log("Interviews count:", interviews.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
