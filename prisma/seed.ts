import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      title: "MOV Clássico — Speed dating",
      slug: "mov-classico-sp-abril-1",
      description:
        "Encontro descontraído com facilitadores, rodízio de conversas e entrada social guiada. Ideal para primeira experiência com a comunidade.",
      type: "CLASSICO",
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      venueName: "Casa parceira — Pinheiros",
      venueAddress: "São Paulo, SP",
      priceCents: 7990,
      memberOnly: false,
      capacity: 24,
    },
    {
      title: "Rolê da comunidade — Forró & novos amigos",
      slug: "role-forro-comunidade-1",
      description:
        "Movimento aberto a assinantes Se Mov. Música ao vivo, roda de apresentações leves e espaço para quem quer expandir o círculo com segurança.",
      type: "COMUNIDADE",
      startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      venueName: "Espaço parceiro — Vila Madalena",
      venueAddress: "São Paulo, SP",
      priceCents: 0,
      memberOnly: true,
      capacity: 40,
    },
    {
      title: "MOV Sensorial — Jantar às cegas sensorial",
      slug: "mov-sensorial-jantar-1",
      description:
        "Menor interferência visual, estímulos sensoriais e dinâmicas para conexão mais profunda. Experiência memorável e compartilhável.",
      type: "SENSORIAL",
      startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      venueName: "Restaurante parceiro — Jardins",
      venueAddress: "São Paulo, SP",
      priceCents: 17990,
      memberOnly: false,
      capacity: 16,
    },
    {
      title: "Trilha urbana + café — Comunidade MOV",
      slug: "trilha-cafe-comunidade",
      description:
        "Caminhada leve em rota curada com parada para café. Somente assinantes ativos do Se Mov.",
      type: "ROLÊ",
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venueName: "Ponto de encontro — Ibirapuera",
      venueAddress: "São Paulo, SP",
      priceCents: 0,
      memberOnly: true,
      capacity: 20,
    },
  ];

  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      create: e,
      update: e,
    });
  }

  console.log("Seed: eventos criados/atualizados.");

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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
