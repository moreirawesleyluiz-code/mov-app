import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.event.deleteMany({
    where: {
      slug: {
        in: [
          "role-forro-comunidade-1",
          "trilha-cafe-comunidade",
          "mov-sensorial-jantar-1",
          "mov-classico-sp-abril-1",
          "sd-sp-2026-04-24",
        ],
      },
    },
  });

  const events = [
    {
      title: "Jantar",
      slug: "se-mov-jantar-1",
      description:
        "Experiência Se Mov para conhecer pessoas novas em uma mesa curada, com presença, conversa e conexão real.",
      type: "SE_MOV_JANTAR",
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      venueName: "Casa parceira — Pinheiros",
      venueAddress: "São Paulo, SP",
      priceCents: 0,
      memberOnly: true,
      capacity: 24,
    },
    {
      title: "Café",
      slug: "se-mov-cafe-1",
      description:
        "Encontro leve e intimista do Se Mov para criar proximidade e continuidade entre pessoas com interesses em comum.",
      type: "SE_MOV_CAFE",
      startsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      venueName: "Café parceiro — Vila Madalena",
      venueAddress: "São Paulo, SP",
      priceCents: 0,
      memberOnly: true,
      capacity: 18,
    },
    {
      title: "Êxodo",
      slug: "se-mov-exodo-1",
      description:
        "Saída curada em grupo para viver a cidade em movimento, fortalecer vínculos e transformar encontros em amizade recorrente.",
      type: "SE_MOV_EXODO",
      startsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      venueName: "Ponto de encontro — Centro",
      venueAddress: "São Paulo, SP",
      priceCents: 0,
      memberOnly: true,
      capacity: 20,
    },
    {
      title: "MOV Clássico — Speed dating",
      slug: "sd-sp-2026-04-22",
      description:
        "Encontro descontraído com facilitadores, rodízio de conversas e entrada social guiada. Ideal para primeira experiência com a comunidade.",
      type: "CLASSICO",
      startsAt: new Date("2026-04-22T20:00:00-03:00"),
      venueName: "Casa parceira — Pinheiros",
      venueAddress: "São Paulo, SP",
      priceCents: 7990,
      memberOnly: false,
      capacity: 24,
    },
    {
      title: "MOV Sensorial — Speed dating",
      slug: "sd-sensorial-sp-2026-04-23",
      description:
        "Estímulos sensoriais e mais profundidade no contato — mesmo universo speed dating, com curadoria MOV.",
      type: "SENSORIAL",
      startsAt: new Date("2026-04-23T20:00:00-03:00"),
      venueName: "Espaço parceiro — Jardins",
      venueAddress: "São Paulo, SP",
      priceCents: 17990,
      memberOnly: false,
      capacity: 16,
    },
    {
      title: "MOV Sensorial — Speed dating",
      slug: "sd-sensorial-sp-2026-04-25",
      description:
        "Estímulos sensoriais e mais profundidade no contato — mesmo universo speed dating, com curadoria MOV.",
      type: "SENSORIAL",
      startsAt: new Date("2026-04-25T18:00:00-03:00"),
      venueName: "Espaço parceiro — Jardins",
      venueAddress: "São Paulo, SP",
      priceCents: 17990,
      memberOnly: false,
      capacity: 16,
    },
    {
      title: "MOV Sensorial — Speed dating",
      slug: "sd-sensorial-sp-2026-04-27",
      description:
        "Estímulos sensoriais e mais profundidade no contato — mesmo universo speed dating, com curadoria MOV.",
      type: "SENSORIAL",
      startsAt: new Date("2026-04-27T20:00:00-03:00"),
      venueName: "Espaço parceiro — Jardins",
      venueAddress: "São Paulo, SP",
      priceCents: 17990,
      memberOnly: false,
      capacity: 16,
    },
    {
      title: "MOV Sensorial — Speed dating",
      slug: "sd-sensorial-sp-2026-04-29",
      description:
        "Estímulos sensoriais e mais profundidade no contato — mesmo universo speed dating, com curadoria MOV.",
      type: "SENSORIAL",
      startsAt: new Date("2026-04-29T20:00:00-03:00"),
      venueName: "Espaço parceiro — Jardins",
      venueAddress: "São Paulo, SP",
      priceCents: 17990,
      memberOnly: false,
      capacity: 16,
    },
    {
      title: "MOV Sensorial — Speed dating",
      slug: "sd-sensorial-sp-2026-05-04",
      description:
        "Estímulos sensoriais e mais profundidade no contato — mesmo universo speed dating, com curadoria MOV.",
      type: "SENSORIAL",
      startsAt: new Date("2026-05-04T20:00:00-03:00"),
      venueName: "Espaço parceiro — Jardins",
      venueAddress: "São Paulo, SP",
      priceCents: 17990,
      memberOnly: false,
      capacity: 16,
    },
    {
      title: "MOV Clássico — Speed dating",
      slug: "sd-sp-2026-04-28",
      description:
        "Encontro descontraído com facilitadores, rodízio de conversas e entrada social guiada. Ideal para primeira experiência com a comunidade.",
      type: "CLASSICO",
      startsAt: new Date("2026-04-28T20:00:00-03:00"),
      venueName: "Casa parceira — Pinheiros",
      venueAddress: "São Paulo, SP",
      priceCents: 7990,
      memberOnly: false,
      capacity: 24,
    },
    {
      title: "MOV Exclusivo — Speed dating",
      slug: "sd-sp-2026-04-30",
      description:
        "Experiência mais cuidada: curadoria, hospitalidade e ambiente refinado — speed dating MOV.",
      type: "EXCLUSIVO",
      startsAt: new Date("2026-04-30T20:00:00-03:00"),
      venueName: "Restaurante parceiro — Itaim",
      venueAddress: "São Paulo, SP",
      priceCents: 54900,
      memberOnly: false,
      capacity: 12,
    },
    {
      title: "MOV Clássico — Speed dating",
      slug: "sd-sp-2026-05-02",
      description:
        "Encontro descontraído com facilitadores, rodízio de conversas e entrada social guiada. Ideal para primeira experiência com a comunidade.",
      type: "CLASSICO",
      startsAt: new Date("2026-05-02T18:00:00-03:00"),
      venueName: "Casa parceira — Pinheiros",
      venueAddress: "São Paulo, SP",
      priceCents: 7990,
      memberOnly: false,
      capacity: 24,
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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
