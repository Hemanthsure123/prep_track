import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: "hemanthsure3@gmail.com" },
    data: { role: UserRole.ADMIN },
  });
  console.log("Updated user to ADMIN:", user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
