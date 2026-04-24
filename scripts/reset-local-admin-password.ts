/**
 * Redefine senha de um utilizador admin na BD local (bcryptjs, 10 rounds — alinhado ao seed).
 * Não usar em produção; não faz commit de credenciais.
 *
 * Uso:
 *   npx tsx scripts/reset-local-admin-password.ts <email> <nova-senha-plana>
 *
 * Exemplo:
 *   npx tsx scripts/reset-local-admin-password.ts admin@example.com minhaSenhaTemporaria
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

async function main() {
  const emailArg = process.argv[2];
  const plain = process.argv[3];
  if (!emailArg?.trim() || !plain) {
    console.error("Uso: npx tsx scripts/reset-local-admin-password.ts <email> <nova-senha-plana>");
    process.exit(1);
  }
  const email = emailArg.toLowerCase().trim();
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) {
    console.error("Utilizador não encontrado ou apagado:", email);
    await prisma.$disconnect();
    process.exit(1);
  }
  if (user.role !== "admin") {
    console.error("Este script só actualiza utilizadores com role=admin. Role actual:", user.role);
    await prisma.$disconnect();
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(plain, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  const check = await bcrypt.compare(plain, passwordHash);
  console.log("OK: senha actualizada para admin", email, "| verificação bcrypt:", check);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
