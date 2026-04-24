import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { isAutomationTestAccountEmail } from "../src/lib/mov-test-user-email";

const prisma = new PrismaClient();

async function main() {
  /** Eventos vêm do painel `/admin/eventos` — o seed não insere mais linhas em `Event` (evita duplicados e lixo local). */
  console.log("Seed: eventos não são mais populados automaticamente (cadastre em /admin/eventos).");

  const adminEmail = process.env.ADMIN_SEED_EMAIL?.toLowerCase().trim();
  const adminPass = process.env.ADMIN_SEED_PASSWORD;
  if (adminEmail && adminPass) {
    const passwordHash = await bcrypt.hash(adminPass, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        name: "Admin MOV",
        passwordHash,
        role: "admin",
      },
      update: {
        role: "admin",
        passwordHash,
      },
    });
    console.log("Seed: utilizador admin garantido para", adminEmail);
  }

  /** Utilizador comum para testar /app e login local (não acede a /admin). */
  const devEmail = process.env.DEV_SEED_EMAIL?.toLowerCase().trim();
  const devPass = process.env.DEV_SEED_PASSWORD;
  if (devEmail && devPass) {
    const passwordHash = await bcrypt.hash(devPass, 10);
    await prisma.user.upsert({
      where: { email: devEmail },
      create: {
        email: devEmail,
        name: "Utilizador teste MOV",
        passwordHash,
        role: "user",
      },
      update: {
        passwordHash,
        role: "user",
      },
    });
    console.log("Seed: utilizador de desenvolvimento (role=user) garantido para", devEmail);
  }

  await prisma.partnerRestaurant.deleteMany({
    where: { name: { in: ["Parceiro Pinheiros (seed)", "Parceiro Jardins (seed)"] } },
  });
  await prisma.partnerRestaurant.createMany({
    data: [
      {
        name: "Parceiro Pinheiros (seed)",
        statusLabel: "ativo",
        partnerType: "restaurant",
        regionKey: "pinheiros-vila-madalena",
        city: "São Paulo",
        neighborhood: "Pinheiros",
        environmentType: "animado / conversa fluida",
        houseStyle: "contemporâneo",
        priceTiersJson: JSON.stringify(["$", "$$", "$$$"]),
        experienceTypesJson: JSON.stringify(["SE_MOV_JANTAR", "CLASSICO", "SENSORIAL"]),
        acceptsDietaryJson: JSON.stringify(["*"]),
        cuisineCategories: "Contemporânea brasileira",
        fitExtrovertedGroup: 72,
        fitIntimateGroup: 48,
        tableCapacity: 8,
        active: true,
      },
      {
        name: "Parceiro Jardins (seed)",
        statusLabel: "ativo",
        partnerType: "restaurant",
        regionKey: "jardins-itaim-moema",
        city: "São Paulo",
        neighborhood: "Jardins",
        environmentType: "intimista",
        houseStyle: "clássico",
        priceTiersJson: JSON.stringify(["$$", "$$$"]),
        experienceTypesJson: JSON.stringify(["SE_MOV_JANTAR", "CLASSICO"]),
        acceptsDietaryJson: JSON.stringify(["vegetariano", "vegano", "sem_gluten"]),
        cuisineCategories: "Italiana / mediterrânea",
        fitIntimateGroup: 78,
        fitDeepTables: 70,
        tableCapacity: 5,
        active: true,
      },
    ],
  });
  console.log("Seed: restaurantes parceiros de demonstração garantidos.");

  const forTestFlag = await prisma.user.findMany({ select: { id: true, email: true, isTestUser: true } });
  let testFlagUpdates = 0;
  for (const u of forTestFlag) {
    const should = isAutomationTestAccountEmail(u.email);
    if (u.isTestUser === should) continue;
    await prisma.user.update({ where: { id: u.id }, data: { isTestUser: should } });
    testFlagUpdates += 1;
  }
  if (testFlagUpdates > 0) {
    console.log(
      `Seed: atualizado isTestUser em ${testFlagUpdates} utilizador(es) (E2E/QA vs operacional).`,
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
