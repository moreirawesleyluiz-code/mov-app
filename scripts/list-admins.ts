/**
 * Lista contas admin na BD local (role=admin, não apagadas).
 * Executar: npx tsx scripts/list-admins.ts
 */
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const admins = await prisma.user.findMany({
    where: { role: "admin", deletedAt: null },
    select: { id: true, email: true, name: true, passwordHash: true },
    orderBy: { email: "asc" },
  });
  for (const a of admins) {
    console.log({
      id: a.id,
      email: a.email,
      name: a.name,
      hasPasswordHash: Boolean(a.passwordHash),
    });
  }
  if (admins.length === 0) console.log("(nenhum admin encontrado)");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
