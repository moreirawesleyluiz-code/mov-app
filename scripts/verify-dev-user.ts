/**
 * Valida utilizador de dev na BD local (email + bcrypt).
 * Executar: npx tsx scripts/verify-dev-user.ts
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = process.env.DEV_SEED_EMAIL ?? "user@mov.local";
const password = process.env.DEV_SEED_PASSWORD ?? "movdev123";

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    console.log("RESULT: no user for", email);
    await prisma.$disconnect();
    process.exit(1);
  }
  if (!user.passwordHash) {
    console.log("RESULT: user has no password (OAuth-only)");
    await prisma.$disconnect();
    process.exit(1);
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log("RESULT:", {
    email: user.email,
    role: user.role,
    deletedAt: user.deletedAt,
    passwordMatchesSeed: ok,
  });
  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
