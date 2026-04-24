/**
 * Remove todos os registros de `Event` no SQLite local.
 * Inscrições (`EventRegistration`) são apagadas em cascata; mesas de curadoria com `eventId` ficam com `eventId` null.
 *
 * Uso: npx tsx scripts/clear-events.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.event.deleteMany({});
  console.log(`[clear-events] Removidos ${result.count} evento(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
