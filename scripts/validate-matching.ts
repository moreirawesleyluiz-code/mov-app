import assert from "node:assert/strict";
import { computePairCompatibility, evaluatePairHardRules } from "@/lib/mov-compatibility-score";
import { evaluateReservationPairHard } from "@/lib/mov-operational-score";
import {
  pickPartnerRestaurantForTable,
  quickRestaurantReservationAudit,
  RESTAURANT_ALLOCATION_LOW_CONFIDENCE_THRESHOLD,
} from "@/lib/mov-restaurant-allocation";
import { getAllocationScheduleSlots, PARTNER_SCHEDULE_DAY_BASIS } from "@/lib/partner-restaurant-schedule";
import { suggestTablesByCompatibility } from "@/lib/mov-mesa-engine";
import { buildMovMatchingProfile } from "@/lib/mov-matching-profile";
import type { MovReservationContext } from "@/lib/mov-reservation-context";

function makeAnswers(seed: number, overrides: Record<string, string> = {}): Record<string, string> {
  return {
    location: seed % 2 === 0 ? "São Paulo" : "Campinas",
    p_opinions: seed % 2 === 0 ? "logica" : "emocoes",
    p_cinema: seed % 2 === 0 ? "cinema" : "bilheteria",
    p_smart_funny: seed % 2 === 0 ? "inteligente" : "engracada",
    p_fashion: seed % 2 === 0 ? "classica" : "moderna",
    p_ideal_night: seed % 3 === 0 ? "vinho" : seed % 3 === 1 ? "jogos" : "criativo",
    p_music: seed % 2 === 0 ? "rock" : "rap",
    p_introvert: String((seed % 10) + 1),
    p_proactive: String(((seed + 2) % 10) + 1),
    p_creative: String(((seed + 3) % 10) + 1),
    p_stressed: String(((seed + 4) % 10) + 1),
    p_great_job: String(((seed + 5) % 10) + 1),
    p_family: String(((seed + 6) % 10) + 1),
    p_spirituality: String(((seed + 7) % 10) + 1),
    p_humor_importance: String(((seed + 8) % 10) + 1),
    p_lonely: String(((seed + 1) % 10) + 1),
    p_friends_out: String(((seed + 9) % 10) + 1),
    p_train: String(((seed + 2) % 10) + 1),
    p_academic: String(((seed + 3) % 10) + 1),
    p_nature_city: String(((seed + 4) % 10) + 1),
    p_dark_humor: String(((seed + 5) % 10) + 1),
    p_politics_news: String(((seed + 6) % 10) + 1),
    id_children: seed % 2 === 0 ? "nao" : "sim",
    id_sector: seed % 2 === 0 ? "tecnologia" : "saude",
    id_birthday: seed % 2 === 0 ? "1993-05-20" : "1989-03-15",
    id_gender: seed % 2 === 0 ? "homem" : "mulher",
    id_relationship: seed % 2 === 0 ? "solteiro" : "relacionamento",
    id_income_band: seed % 2 === 0 ? "medio" : "alto",
    id_dietary: seed % 2 === 0 ? "onivoro" : "vegetariano",
    id_availability: seed % 2 === 0 ? "quarta-noite" : "quinta-noite",
    ...overrides,
  };
}

function profile(seed: number, overrides: Record<string, string> = {}) {
  const answers = makeAnswers(seed, overrides);
  return buildMovMatchingProfile({ answers, cityName: answers.location });
}

function res(partial: Partial<MovReservationContext>): MovReservationContext {
  return {
    eventId: "evt_seed",
    eventType: "SE_MOV_JANTAR",
    memberOnly: true,
    status: "confirmed",
    regionKey: "pinheiros-vila-madalena",
    budgetTiers: ["$$"],
    languages: ["pt"],
    dietaryRestrictions: false,
    dietaryTypes: [],
    availabilitySlots: ["quinta-noite"],
    ...partial,
  };
}

function run() {
  assert.equal(RESTAURANT_ALLOCATION_LOW_CONFIDENCE_THRESHOLD, 52, "limiar admin alinhado com UI");

  const users = Array.from({ length: 13 }, (_, i) => ({
    userId: `u${i + 1}`,
    profile: profile(i + 1),
    reservation: null as MovReservationContext | null,
  }));
  const tables = suggestTablesByCompatibility(users);
  assert.ok(tables.length >= 3, "deve criar mesas suficientes para 13 participantes");
  assert.ok(tables.every((t) => t.userIds.length <= 6), "nenhuma mesa deve ultrapassar 6 lugares");

  const ageA = profile(1, { id_birthday: "1999-01-01" });
  const ageB = profile(2, { id_birthday: "1960-01-01" });
  const hardAge = evaluatePairHardRules(ageA, ageB);
  assert.equal(hardAge.isAllowed, false, "faixa etária deve entrar em regra dura");

  const sectorSameA = profile(3, { id_sector: "tecnologia" });
  const sectorSameB = profile(4, { id_sector: "tecnologia" });
  const sectorDiff = profile(5, { id_sector: "saude" });
  const pairSame = computePairCompatibility(sectorSameA, sectorSameB);
  const pairDiff = computePairCompatibility(sectorSameA, sectorDiff);
  assert.ok(
    pairSame.subScores.find((s) => s.key === "professionArea")!.score >
      pairDiff.subScores.find((s) => s.key === "professionArea")!.score,
    "setor/profissão deve impactar score",
  );

  const incomeA = profile(6, { id_income_band: "alto" });
  const incomeB = profile(7, { id_income_band: "alto" });
  const incomeC = profile(8, { id_income_band: "baixo" });
  assert.ok(
    computePairCompatibility(incomeA, incomeB).subScores.find((s) => s.key === "budgetFit")!.score >
      computePairCompatibility(incomeA, incomeC).subScores.find((s) => s.key === "budgetFit")!.score,
    "faixa de investimento deve impactar score",
  );

  const dietA = profile(9, { id_dietary: "vegano" });
  const dietB = profile(10, { id_dietary: "vegano" });
  const dietC = profile(11, { id_dietary: "onivoro" });
  assert.ok(
    computePairCompatibility(dietA, dietB).subScores.find((s) => s.key === "dietFit")!.score >
      computePairCompatibility(dietA, dietC).subScores.find((s) => s.key === "dietFit")!.score,
    "alimentação deve impactar score",
  );

  const cityA = profile(12, { location: "São Paulo" });
  const cityB = profile(13, { location: "São Paulo" });
  const cityC = profile(14, { location: "Campinas" });
  assert.ok(
    computePairCompatibility(cityA, cityB).subScores.find((s) => s.key === "location")!.score >
      computePairCompatibility(cityA, cityC).subScores.find((s) => s.key === "location")!.score,
    "localização deve impactar score",
  );

  const answersInfluenceA = profile(15, { p_introvert: "10", p_humor_importance: "10" });
  const answersInfluenceB = profile(16, { p_introvert: "10", p_humor_importance: "10" });
  const answersInfluenceC = profile(17, { p_introvert: "1", p_humor_importance: "1" });
  const closePair = computePairCompatibility(answersInfluenceA, answersInfluenceB);
  const farPair = computePairCompatibility(answersInfluenceA, answersInfluenceC);
  assert.ok(
    closePair.subScores.find((s) => s.key === "socialEnergy")!.score >
      farPair.subScores.find((s) => s.key === "socialEnergy")!.score,
    "respostas do onboarding devem alterar compatibilidade",
  );

  const rPin = res({ regionKey: "pinheiros-vila-madalena" });
  const rJar = res({ regionKey: "jardins-itaim-moema" });
  assert.equal(evaluateReservationPairHard(rPin, rJar).isAllowed, false, "região da reserva deve bloquear par incompatível");

  const rCheap = res({ budgetTiers: ["$"] });
  const rLux = res({ budgetTiers: ["$$$"] });
  assert.equal(evaluateReservationPairHard(rCheap, rLux).isAllowed, false, "orçamento sem interseção deve bloquear");

  const rA = res({ availabilitySlots: ["seg-noite"] });
  const rB = res({ availabilitySlots: ["ter-noite"] });
  assert.equal(evaluateReservationPairHard(rA, rB).isAllowed, false, "disponibilidade sem interseção deve bloquear");

  const pick = pickPartnerRestaurantForTable(
    "SE_MOV_JANTAR",
    [
      { userId: "a", profile: profile(30), reservation: res({ regionKey: "pinheiros-vila-madalena", budgetTiers: ["$$"] }) },
      { userId: "b", profile: profile(31), reservation: res({ regionKey: "pinheiros-vila-madalena", budgetTiers: ["$$", "$$$"] }) },
    ],
    [
      {
        id: "rst_seed",
        name: "Rest Seed",
        regionKey: "pinheiros-vila-madalena",
        priceTiersJson: JSON.stringify(["$", "$$", "$$$"]),
        experienceTypesJson: JSON.stringify(["SE_MOV_JANTAR"]),
        acceptsDietaryJson: JSON.stringify(["*"]),
        active: true,
      },
    ],
  );
  assert.equal(pick.restaurantId, "rst_seed");
  assert.ok(pick.line.includes("Rest Seed"), "restaurante coerente com região + orçamento + experiência");
  assert.ok(Array.isArray(pick.positiveReasons), "pick expõe razões positivas");
  assert.ok(pick.aggregateScore >= 48, "score agregado do restaurante calculado");

  const rawLegacy = JSON.stringify({ slots: [{ dayOfWeek: 3, slotKey: "qua-noite" }] });
  const leg = getAllocationScheduleSlots(rawLegacy);
  assert.equal(leg.length, 1);
  assert.equal(leg[0]!.dayOfWeek, 3);

  const rawV2Inactive = JSON.stringify({
    schemaVersion: 2,
    dayBasis: PARTNER_SCHEDULE_DAY_BASIS,
    slots: [{ dayOfWeek: 1, slotKind: "dinner", active: false }],
  });
  assert.equal(getAllocationScheduleSlots(rawV2Inactive).length, 0, "slots inactivos não entram na alocação");

  const mondayUtc = new Date("2026-01-05T22:00:00.000Z");
  assert.equal(mondayUtc.getUTCDay(), 1, "fixture: segunda em UTC");

  const schedWednesdayOnly = JSON.stringify({
    schemaVersion: 2,
    dayBasis: PARTNER_SCHEDULE_DAY_BASIS,
    slots: [{ dayOfWeek: 3, slotKind: "dinner", active: true }],
  });

  type PR = Parameters<typeof pickPartnerRestaurantForTable>[2][number];
  function partnerBase(overrides: Partial<PR> & { id: string; name: string }): PR {
    return {
      regionKey: "pinheiros-vila-madalena",
      priceTiersJson: JSON.stringify(["$", "$$", "$$$"]),
      experienceTypesJson: JSON.stringify(["SE_MOV_JANTAR"]),
      acceptsDietaryJson: JSON.stringify(["*"]),
      active: true,
      seatsPerTableMax: 6,
      tableCapacity: 4,
      availabilityKeysJson: JSON.stringify([]),
      scheduleJson: null,
      ...overrides,
    };
  }

  const twoMembers = [
    { userId: "a", profile: profile(40), reservation: res({ regionKey: "pinheiros-vila-madalena", budgetTiers: ["$$"] }) },
    { userId: "b", profile: profile(41), reservation: res({ regionKey: "pinheiros-vila-madalena", budgetTiers: ["$$"] }) },
  ];

  const pickBadSchedule = pickPartnerRestaurantForTable("SE_MOV_JANTAR", twoMembers, [partnerBase({ id: "p1", name: "Só qua", scheduleJson: schedWednesdayOnly })], {
    eventStartsAt: mondayUtc,
  });
  assert.equal(pickBadSchedule.restaurantId, null, "agenda incompatível deve impedir escolha");

  const pickGoodAmongTwo = pickPartnerRestaurantForTable(
    "SE_MOV_JANTAR",
    twoMembers,
    [
      partnerBase({ id: "p-wed", name: "Só qua", scheduleJson: schedWednesdayOnly }),
      partnerBase({ id: "p-ok", name: "Encaixa", scheduleJson: null }),
    ],
    { eventStartsAt: mondayUtc },
  );
  assert.equal(pickGoodAmongTwo.restaurantId, "p-ok", "entre elegíveis, o que casa com a agenda deve ganhar");

  const pickInactive = pickPartnerRestaurantForTable("SE_MOV_JANTAR", twoMembers, [partnerBase({ id: "in", name: "Off", active: false })], {
    eventStartsAt: mondayUtc,
  });
  assert.equal(pickInactive.restaurantId, null, "parceiro inactivo não é sugerido");

  const pickFullTables = pickPartnerRestaurantForTable("SE_MOV_JANTAR", twoMembers, [partnerBase({ id: "full", name: "Lotado", tableCapacity: 1 })], {
    eventStartsAt: mondayUtc,
    allocationCounts: new Map([["full", 1]]),
  });
  assert.equal(pickFullTables.restaurantId, null, "lotacao de mesas por evento bloqueia");

  const fiveMembers = Array.from({ length: 5 }, (_, i) => ({
    userId: `u${i}`,
    profile: profile(50 + i),
    reservation: res({ regionKey: "pinheiros-vila-madalena", budgetTiers: ["$$"] }),
  }));
  const pickSeatsPerTable = pickPartnerRestaurantForTable("SE_MOV_JANTAR", fiveMembers, [partnerBase({ id: "spt", name: "Max4", seatsPerTableMax: 4 })], {
    eventStartsAt: mondayUtc,
  });
  assert.equal(pickSeatsPerTable.restaurantId, null, "seatsPerTableMax menor que a mesa bloqueia");

  const pickSeatBudget = pickPartnerRestaurantForTable("SE_MOV_JANTAR", twoMembers, [partnerBase({ id: "sb", name: "SB", tableCapacity: 1, seatsPerTableMax: 6 })], {
    eventStartsAt: mondayUtc,
    allocationSeatCounts: new Map([["sb", 5]]),
    tableSeatCount: 2,
  });
  assert.equal(pickSeatBudget.restaurantId, null, "soma de lugares comprometidos não pode exceder tecto teórico");

  const closeA = partnerBase({
    id: "closeA",
    name: "A",
    fitLightTables: 90,
    fitDeepTables: 90,
    fitPremiumExperience: 90,
    fitFirstEncounter: 90,
    fitExtrovertedGroup: 90,
    fitIntimateGroup: 90,
  });
  const closeB = partnerBase({
    id: "closeB",
    name: "B",
    fitLightTables: 88,
    fitDeepTables: 88,
    fitPremiumExperience: 88,
    fitFirstEncounter: 88,
    fitExtrovertedGroup: 88,
    fitIntimateGroup: 88,
  });
  const pickTie = pickPartnerRestaurantForTable("SE_MOV_JANTAR", twoMembers, [closeB, closeA], { eventStartsAt: mondayUtc });
  assert.ok(pickTie.restaurantId === "closeA" || pickTie.restaurantId === "closeB", "entre dois viáveis, um vence");
  assert.ok(pickTie.runnerUpNotes?.length, "runner-up documentado quando há alternativa");

  const auditDiet = quickRestaurantReservationAudit(
    {
      regionKey: "pinheiros-vila-madalena",
      acceptsDietaryJson: JSON.stringify(["onivoro"]),
      priceTiersJson: JSON.stringify(["$$"]),
      seatsPerTableMax: 6,
      scheduleJson: null,
      tableCapacity: 10,
      active: true,
    },
    [res({ dietaryRestrictions: true, dietaryTypes: ["vegano"] })],
    2,
  );
  assert.ok(auditDiet.labels.includes("dieta"), "auditoria marca dieta");

  const auditRegion = quickRestaurantReservationAudit(
    {
      regionKey: "jardins-itaim-moema",
      acceptsDietaryJson: JSON.stringify(["*"]),
      priceTiersJson: JSON.stringify(["$$"]),
      seatsPerTableMax: 6,
      scheduleJson: null,
      tableCapacity: 10,
      active: true,
    },
    [res({ regionKey: "pinheiros-vila-madalena" })],
    2,
  );
  assert.ok(auditRegion.labels.includes("regiao"), "auditoria marca região");

  const auditBudget = quickRestaurantReservationAudit(
    {
      regionKey: "pinheiros-vila-madalena",
      acceptsDietaryJson: JSON.stringify(["*"]),
      priceTiersJson: JSON.stringify(["$"]),
      seatsPerTableMax: 6,
      scheduleJson: null,
      tableCapacity: 10,
      active: true,
    },
    [res({ budgetTiers: ["$$$"] })],
    2,
  );
  assert.ok(auditBudget.labels.includes("orcamento"), "auditoria marca orçamento");

  const auditAgenda = quickRestaurantReservationAudit(
    {
      regionKey: "pinheiros-vila-madalena",
      acceptsDietaryJson: JSON.stringify(["*"]),
      priceTiersJson: JSON.stringify(["$$"]),
      seatsPerTableMax: 6,
      scheduleJson: schedWednesdayOnly,
      tableCapacity: 2,
      active: true,
    },
    [res({})],
    2,
    { eventStartsAt: mondayUtc, scheduleJson: schedWednesdayOnly },
  );
  assert.ok(auditAgenda.labels.includes("agenda"), "auditoria marca agenda");

  const auditCap = quickRestaurantReservationAudit(
    {
      regionKey: "pinheiros-vila-madalena",
      acceptsDietaryJson: JSON.stringify(["*"]),
      priceTiersJson: JSON.stringify(["$$"]),
      seatsPerTableMax: 6,
      scheduleJson: null,
      tableCapacity: 2,
      active: true,
    },
    [res({})],
    2,
    { tablesAllocatedInEvent: 2, seatsCommittedInEvent: 10 },
  );
  assert.ok(auditCap.labels.includes("capacidade-mesas"), "auditoria marca saturação de mesas");

  const auditInactive = quickRestaurantReservationAudit(
    {
      regionKey: "pinheiros-vila-madalena",
      acceptsDietaryJson: JSON.stringify(["*"]),
      priceTiersJson: JSON.stringify(["$$"]),
      seatsPerTableMax: 6,
      scheduleJson: null,
      tableCapacity: 10,
      active: false,
    },
    [res({})],
    2,
  );
  assert.ok(auditInactive.labels.includes("parceiro-inativo"), "auditoria marca inactivo");

  const auditAvail = quickRestaurantReservationAudit(
    {
      regionKey: "pinheiros-vila-madalena",
      acceptsDietaryJson: JSON.stringify(["*"]),
      priceTiersJson: JSON.stringify(["$$"]),
      seatsPerTableMax: 6,
      scheduleJson: null,
      tableCapacity: 10,
      active: true,
      availabilityKeysJson: JSON.stringify(["quinta-noite"]),
    },
    [res({ availabilitySlots: ["ter-noite"] })],
    2,
  );
  assert.ok(auditAvail.labels.includes("disponibilidade"), "auditoria marca disponibilidade (turnos)");

  const auditAvailSemSlots = quickRestaurantReservationAudit(
    {
      regionKey: "pinheiros-vila-madalena",
      acceptsDietaryJson: JSON.stringify(["*"]),
      priceTiersJson: JSON.stringify(["$$"]),
      seatsPerTableMax: 6,
      scheduleJson: null,
      tableCapacity: 10,
      active: true,
      availabilityKeysJson: JSON.stringify(["quinta-noite"]),
    },
    [res({ availabilitySlots: [] })],
    2,
  );
  assert.ok(auditAvailSemSlots.labels.includes("disponibilidade"), "auditoria marca disponibilidade (sem slots)");

  console.log("OK: validações principais do motor de matching passaram.");
}

run();
