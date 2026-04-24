"use server";

/**
 * Server actions da curadoria de mesas e sugestão de restaurante.
 * Persistência de `allocationMetaJson` na última sugestão automática; contagens por evento/parceiro em `suggestMesasForEvent` / `resuggestMesaRestaurant`.
 */

import { revalidatePath } from "next/cache";
import { assertAdminRole } from "@/lib/admin-auth";
import { MAX_MESA_SIZE } from "@/lib/admin-mesa-suggest";
import { getOperationalState } from "@/lib/admin-user-state";
import { DEFAULT_MOV_MATCHING_CONFIG } from "@/lib/mov-matching-config";
import { suggestTablesByCompatibility, type MovMatchingCandidate } from "@/lib/mov-mesa-engine";
import { pickPartnerRestaurantForTable } from "@/lib/mov-restaurant-allocation";
import { buildMovReservationContext, type EventRegistrationRow, type EventRowMini } from "@/lib/mov-reservation-context";
import { buildMovMatchingProfile, parseStoredMovMatchingProfile } from "@/lib/mov-matching-profile";
import { prisma } from "@/lib/prisma";

/** Lista operacional e ecrã de curadoria partilham os mesmos dados — invalidar ambos após mutações. */
function revalidateAdminMesaViews() {
  revalidatePath("/admin/mesas");
  revalidatePath("/admin/montagem");
}

async function assertTableCapacity(tableId: string) {
  const n = await prisma.adminCuratedTableMember.count({ where: { tableId } });
  if (n >= MAX_MESA_SIZE) throw new Error(`Esta mesa já tem ${MAX_MESA_SIZE} pessoas (máximo).`);
}

export async function createMesa(name: string) {
  await assertAdminRole();
  const trimmed = name.trim() || "Nova mesa";
  const maxOrder = await prisma.adminCuratedTable.aggregate({ _max: { sortOrder: true } });
  await prisma.adminCuratedTable.create({
    data: {
      name: trimmed,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      status: "draft",
    },
  });
  revalidateAdminMesaViews();
}

export async function deleteMesa(tableId: string) {
  await assertAdminRole();
  await prisma.adminCuratedTable.delete({ where: { id: tableId } });
  revalidateAdminMesaViews();
}

export async function setMesaStatus(tableId: string, status: "draft" | "finalized") {
  await assertAdminRole();
  await prisma.adminCuratedTable.update({ where: { id: tableId }, data: { status } });
  revalidateAdminMesaViews();
}

export async function addMemberToMesa(tableId: string, userId: string) {
  await assertAdminRole();
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) throw new Error("Participante não encontrado ou inativo.");
  const existing = await prisma.adminCuratedTableMember.findUnique({ where: { userId } });
  if (existing && existing.tableId !== tableId) {
    throw new Error("Este participante já está noutra mesa. Remova primeiro ou mova.");
  }
  if (existing?.tableId === tableId) return;
  await assertTableCapacity(tableId);
  await prisma.adminCuratedTableMember.create({
    data: { tableId, userId, pinned: false },
  });
  revalidateAdminMesaViews();
  revalidatePath("/admin");
}

export async function removeMember(memberId: string) {
  await assertAdminRole();
  await prisma.adminCuratedTableMember.delete({ where: { id: memberId } });
  revalidateAdminMesaViews();
  revalidatePath("/admin");
}

export async function moveMemberToMesa(userId: string, targetTableId: string | null) {
  await assertAdminRole();
  const row = await prisma.adminCuratedTableMember.findUnique({ where: { userId } });
  if (!row) throw new Error("Participante não está em nenhuma mesa.");
  if (targetTableId === null) {
    await prisma.adminCuratedTableMember.delete({ where: { id: row.id } });
    revalidateAdminMesaViews();
    revalidatePath("/admin");
    return;
  }
  if (row.tableId === targetTableId) return;
  const countTarget = await prisma.adminCuratedTableMember.count({ where: { tableId: targetTableId } });
  if (row.tableId !== targetTableId && countTarget >= MAX_MESA_SIZE) {
    throw new Error("Mesa cheia (máx. 6).");
  }
  await prisma.adminCuratedTableMember.update({
    where: { id: row.id },
    data: { tableId: targetTableId },
  });
  revalidateAdminMesaViews();
  revalidatePath("/admin");
}

export async function setMemberPinned(memberId: string, pinned: boolean) {
  await assertAdminRole();
  await prisma.adminCuratedTableMember.update({
    where: { id: memberId },
    data: { pinned },
  });
  revalidateAdminMesaViews();
}

async function loadMatchingCandidates(userIds: string[]): Promise<MovMatchingCandidate[]> {
  const rows: MovMatchingCandidate[] = [];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      city: true,
      onboardingAnswers: { select: { questionId: true, answerValue: true } },
      compatibilityProfile: { select: { axesJson: true } },
    },
  });
  for (const u of users) {
    const fromStored = parseStoredMovMatchingProfile(u.compatibilityProfile?.axesJson);
    if (fromStored) {
      rows.push({ userId: u.id, profile: fromStored, reservation: null });
      continue;
    }
    const answers = Object.fromEntries(u.onboardingAnswers.map((a) => [a.questionId, a.answerValue])) as Record<string, string>;
    rows.push({
      userId: u.id,
      profile: buildMovMatchingProfile({
        answers,
        cityName: u.city,
      }),
      reservation: null,
    });
  }
  return rows;
}

async function loadMatchingCandidatesForEvent(
  userIds: string[],
  event: EventRowMini,
  regByUserId: Map<string, EventRegistrationRow>,
): Promise<MovMatchingCandidate[]> {
  const base = await loadMatchingCandidates(userIds);
  return base.map((c) => {
    const reg = regByUserId.get(c.userId) ?? null;
    const reservation = buildMovReservationContext(event, reg);
    return { ...c, reservation };
  });
}

/** Apenas participantes prontos para curadoria e sem mesa — cria mesas novas "Auto N". */
export async function suggestMesasForUnallocated() {
  await assertAdminRole();
  const allUsers = await prisma.user.findMany({
    where: { deletedAt: null, role: "user", isTestUser: false },
    select: {
      id: true,
      onboardingAnswers: { select: { questionId: true } },
    },
  });
  const allocated = new Set(
    (await prisma.adminCuratedTableMember.findMany({ select: { userId: true } })).map((m) => m.userId),
  );
  const unallocated: string[] = [];
  for (const u of allUsers) {
    const st = getOperationalState(u.onboardingAnswers.length);
    if (st !== "ready") continue;
    if (!allocated.has(u.id)) unallocated.push(u.id);
  }
  if (unallocated.length === 0) return { created: 0, message: "Não há participantes prontos e sem mesa." };

  const candidates = await loadMatchingCandidates(unallocated);
  const groups = suggestTablesByCompatibility(candidates, {
    ...DEFAULT_MOV_MATCHING_CONFIG,
    hardRules: {
      ...DEFAULT_MOV_MATCHING_CONFIG.hardRules,
      maxMesaSize: MAX_MESA_SIZE,
    },
  });
  const baseOrder = (await prisma.adminCuratedTable.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;

  let n = 0;
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < groups.length; i++) {
      const ids = groups[i]!.userIds;
      const t = await tx.adminCuratedTable.create({
        data: {
          name: `Sugestão auto ${baseOrder + i + 1}`,
          sortOrder: baseOrder + i + 1,
          status: "draft",
        },
      });
      for (const uid of ids) {
        await tx.adminCuratedTableMember.create({
          data: { tableId: t.id, userId: uid, pinned: false },
        });
      }
      n++;
    }
  });

  revalidateAdminMesaViews();
  revalidatePath("/admin");
  return { created: n, message: `${n} mesa(s) sugerida(s) para ${unallocated.length} participante(s).` };
}

/**
 * Sugere mesas usando perfil MOV + dados operacionais da inscrição no evento (região, orçamento, alimentação, disponibilidade)
 * e escolhe restaurante parceiro quando houver candidato na base.
 */
async function partnerAllocationCountsForEvent(eventId: string): Promise<Map<string, number>> {
  const rows = await prisma.adminCuratedTable.groupBy({
    by: ["partnerRestaurantId"],
    where: { eventId, partnerRestaurantId: { not: null } },
    _count: { _all: true },
  });
  const m = new Map<string, number>();
  for (const r of rows) {
    if (r.partnerRestaurantId) m.set(r.partnerRestaurantId, r._count._all);
  }
  return m;
}

/** Soma de lugares (membros) por parceiro neste evento — para pressão de capacidade e lotes na alocação. */
async function partnerAllocationSeatCountsForEvent(eventId: string): Promise<Map<string, number>> {
  const rows = await prisma.adminCuratedTable.findMany({
    where: { eventId, partnerRestaurantId: { not: null } },
    select: {
      partnerRestaurantId: true,
      _count: { select: { members: true } },
    },
  });
  const m = new Map<string, number>();
  for (const r of rows) {
    if (!r.partnerRestaurantId) continue;
    const id = r.partnerRestaurantId;
    m.set(id, (m.get(id) ?? 0) + r._count.members);
  }
  return m;
}

export async function suggestMesasForEvent(eventId: string) {
  await assertAdminRole();
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, type: true, memberOnly: true, title: true, startsAt: true },
  });
  if (!event) throw new Error("Evento não encontrado.");

  const regs = await prisma.eventRegistration.findMany({
    where: { eventId, status: "confirmed" },
    select: {
      userId: true,
      status: true,
      regionKey: true,
      dinnerLanguages: true,
      dinnerBudgetTiers: true,
      dietaryRestrictions: true,
      dietaryTypes: true,
      availabilitySlotsJson: true,
    },
  });
  const regByUserId = new Map<string, EventRegistrationRow>(
    regs.map((r) => [
      r.userId,
      {
        eventId,
        status: r.status,
        regionKey: r.regionKey,
        dinnerLanguages: r.dinnerLanguages,
        dinnerBudgetTiers: r.dinnerBudgetTiers,
        dietaryRestrictions: r.dietaryRestrictions,
        dietaryTypes: r.dietaryTypes,
        availabilitySlotsJson: r.availabilitySlotsJson,
      } satisfies EventRegistrationRow,
    ]),
  );

  const allocated = new Set(
    (await prisma.adminCuratedTableMember.findMany({ select: { userId: true } })).map((m) => m.userId),
  );

  const allUsers = await prisma.user.findMany({
    where: { deletedAt: null, role: "user", isTestUser: false },
    select: {
      id: true,
      onboardingAnswers: { select: { questionId: true } },
    },
  });

  const unallocated: string[] = [];
  for (const u of allUsers) {
    if (getOperationalState(u.onboardingAnswers.length) !== "ready") continue;
    if (!regByUserId.has(u.id)) continue;
    if (!allocated.has(u.id)) unallocated.push(u.id);
  }

  if (unallocated.length === 0) {
    return { created: 0, message: "Não há participantes confirmados no evento, prontos e sem mesa." };
  }

  const eventMini: EventRowMini = { id: event.id, type: event.type, memberOnly: event.memberOnly };
  const candidates = await loadMatchingCandidatesForEvent(unallocated, eventMini, regByUserId);

  const partners = await prisma.partnerRestaurant.findMany({
    where: { active: true },
  });

  const groups = suggestTablesByCompatibility(candidates, {
    ...DEFAULT_MOV_MATCHING_CONFIG,
    hardRules: {
      ...DEFAULT_MOV_MATCHING_CONFIG.hardRules,
      maxMesaSize: MAX_MESA_SIZE,
    },
  });

  const baseOrder = (await prisma.adminCuratedTable.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;

  const allocationCounts = await partnerAllocationCountsForEvent(event.id);
  const allocationSeatCounts = await partnerAllocationSeatCountsForEvent(event.id);

  let n = 0;
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < groups.length; i++) {
      const ids = groups[i]!.userIds;
      const groupMembers = candidates.filter((c) => ids.includes(c.userId));
      const pick = pickPartnerRestaurantForTable(event.type, groupMembers, partners, {
        eventStartsAt: event.startsAt,
        allocationCounts,
        allocationSeatCounts,
        tableSeatCount: ids.length,
      });
      if (pick.restaurantId) {
        allocationCounts.set(pick.restaurantId, (allocationCounts.get(pick.restaurantId) ?? 0) + 1);
        allocationSeatCounts.set(
          pick.restaurantId,
          (allocationSeatCounts.get(pick.restaurantId) ?? 0) + ids.length,
        );
      }

      const allocationMetaJson = JSON.stringify({
        version: 3,
        eventId: event.id,
        eventTitle: event.title,
        restaurantPick: pick,
        tableExplanation: groups[i]!.explanation,
        generatedAt: new Date().toISOString(),
      });

      const t = await tx.adminCuratedTable.create({
        data: {
          name: `Evento ${event.title.slice(0, 24)} · Auto ${baseOrder + i + 1}`,
          sortOrder: baseOrder + i + 1,
          status: "draft",
          eventId: event.id,
          partnerRestaurantId: pick.restaurantId,
          allocationMetaJson,
        },
      });
      for (const uid of ids) {
        await tx.adminCuratedTableMember.create({
          data: { tableId: t.id, userId: uid, pinned: false },
        });
      }
      n++;
    }
  });

  revalidateAdminMesaViews();
  revalidatePath("/admin");
  return { created: n, message: `${n} mesa(s) sugerida(s) para ${unallocated.length} participante(s) do evento.` };
}

export async function setMesaPartnerRestaurant(tableId: string, partnerRestaurantId: string | null) {
  await assertAdminRole();
  const row = await prisma.adminCuratedTable.findUnique({
    where: { id: tableId },
    select: { allocationMetaJson: true, partnerRestaurantId: true },
  });
  if (!row) throw new Error("Mesa não encontrada.");

  /**
   * Política operacional (parceiro inactivo):
   * - Sugestão automática e re-sugestão já só usam parceiros `active: true`.
   * - Atribuição manual: só é permitido escolher parceiro inactivo se for **manter o vínculo já existente**
   *   (mesmo id). Novas atribuições ou troca para outro inactivo são bloqueadas — preserva histórico sem ambiguidade.
   */
  if (partnerRestaurantId !== null) {
    const partner = await prisma.partnerRestaurant.findUnique({
      where: { id: partnerRestaurantId },
      select: { active: true },
    });
    if (!partner) throw new Error("Restaurante parceiro não encontrado.");
    if (!partner.active && row.partnerRestaurantId !== partnerRestaurantId) {
      throw new Error(
        "Parceiros inativos não podem ser atribuídos a novas mesas nem trocados por outro inativo. Escolha um parceiro ativo ou mantenha o vínculo actual.",
      );
    }
  }

  let meta: Record<string, unknown> = {};
  if (row.allocationMetaJson) {
    try {
      meta = JSON.parse(row.allocationMetaJson) as Record<string, unknown>;
    } catch {
      meta = {};
    }
  }
  meta.manualRestaurant = true;
  meta.manualRestaurantAt = new Date().toISOString();

  await prisma.adminCuratedTable.update({
    where: { id: tableId },
    data: { partnerRestaurantId, allocationMetaJson: JSON.stringify(meta) },
  });
  revalidateAdminMesaViews();
}

/** Recalcula apenas o restaurante sugerido/atribuído para uma mesa já ligada a um evento. */
export async function resuggestMesaRestaurant(tableId: string) {
  await assertAdminRole();
  const table = await prisma.adminCuratedTable.findUnique({
    where: { id: tableId },
    include: {
      event: { select: { id: true, type: true, memberOnly: true, title: true, startsAt: true } },
      members: { select: { userId: true } },
    },
  });
  if (!table?.eventId || !table.event) {
    throw new Error("Esta mesa precisa estar associada a um evento para sugerir restaurante com base na reserva.");
  }

  const userIds = table.members.map((m) => m.userId);
  const regs = await prisma.eventRegistration.findMany({
    where: { eventId: table.eventId, userId: { in: userIds } },
    select: {
      userId: true,
      status: true,
      regionKey: true,
      dinnerLanguages: true,
      dinnerBudgetTiers: true,
      dietaryRestrictions: true,
      dietaryTypes: true,
      availabilitySlotsJson: true,
    },
  });
  const evId = table.eventId;
  if (!evId) throw new Error("Mesa sem evento.");

  const regByUserId = new Map<string, EventRegistrationRow>(
    regs.map((r) => [
      r.userId,
      {
        eventId: evId,
        status: r.status,
        regionKey: r.regionKey,
        dinnerLanguages: r.dinnerLanguages,
        dinnerBudgetTiers: r.dinnerBudgetTiers,
        dietaryRestrictions: r.dietaryRestrictions,
        dietaryTypes: r.dietaryTypes,
        availabilitySlotsJson: r.availabilitySlotsJson,
      } satisfies EventRegistrationRow,
    ]),
  );

  const eventMini: EventRowMini = {
    id: table.event.id,
    type: table.event.type,
    memberOnly: table.event.memberOnly,
  };
  const groupMembers = await loadMatchingCandidatesForEvent(userIds, eventMini, regByUserId);
  const partners = await prisma.partnerRestaurant.findMany({ where: { active: true } });
  const allocationCounts = await partnerAllocationCountsForEvent(evId);
  const allocationSeatCounts = await partnerAllocationSeatCountsForEvent(evId);
  const rid = table.partnerRestaurantId;
  const nMembers = userIds.length;
  if (rid) {
    const c = allocationCounts.get(rid) ?? 0;
    if (c > 0) allocationCounts.set(rid, c - 1);
    const sc = allocationSeatCounts.get(rid) ?? 0;
    if (sc >= nMembers) allocationSeatCounts.set(rid, sc - nMembers);
  }

  const pick = pickPartnerRestaurantForTable(table.event.type, groupMembers, partners, {
    eventStartsAt: table.event.startsAt,
    allocationCounts,
    allocationSeatCounts,
    tableSeatCount: userIds.length,
  });

  let meta: Record<string, unknown> = {};
  if (table.allocationMetaJson) {
    try {
      meta = JSON.parse(table.allocationMetaJson) as Record<string, unknown>;
    } catch {
      meta = {};
    }
  }
  meta.version = 3;
  meta.eventId = evId;
  meta.eventTitle = table.event.title;
  meta.restaurantPick = pick;
  meta.manualRestaurant = false;
  meta.restaurantRegeneratedAt = new Date().toISOString();

  await prisma.adminCuratedTable.update({
    where: { id: tableId },
    data: {
      partnerRestaurantId: pick.restaurantId,
      allocationMetaJson: JSON.stringify(meta),
    },
  });
  revalidateAdminMesaViews();
  return { message: pick.restaurantId ? pick.line : "Sem candidato automático — escolha manual." };
}

/** Remove vínculos não fixados e volta a agrupar esses participantes em mesas novas. Participantes fixados mantêm-se. */
export async function recalculateNonPinnedMesas() {
  await assertAdminRole();
  await prisma.adminCuratedTableMember.deleteMany({ where: { pinned: false } });

  const allUsers = await prisma.user.findMany({
    where: { deletedAt: null, role: "user", isTestUser: false },
    select: {
      id: true,
      onboardingAnswers: { select: { questionId: true } },
    },
  });
  const allocatedAfter = new Set(
    (await prisma.adminCuratedTableMember.findMany({ select: { userId: true } })).map((m) => m.userId),
  );
  const pool: string[] = [];
  for (const u of allUsers) {
    if (getOperationalState(u.onboardingAnswers.length) !== "ready") continue;
    if (!allocatedAfter.has(u.id)) pool.push(u.id);
  }

  if (pool.length === 0) {
    revalidateAdminMesaViews();
    return { created: 0, message: "Nenhum participante pronto para realocar após limpar não fixados." };
  }

  const candidates = await loadMatchingCandidates(pool);
  const groups = suggestTablesByCompatibility(candidates, {
    ...DEFAULT_MOV_MATCHING_CONFIG,
    hardRules: {
      ...DEFAULT_MOV_MATCHING_CONFIG.hardRules,
      maxMesaSize: MAX_MESA_SIZE,
    },
  });
  const baseOrder = (await prisma.adminCuratedTable.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;

  let n = 0;
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < groups.length; i++) {
      const ids = groups[i]!.userIds;
      const t = await tx.adminCuratedTable.create({
        data: {
          name: `Recalculo ${baseOrder + i + 1}`,
          sortOrder: baseOrder + i + 1,
          status: "draft",
        },
      });
      for (const uid of ids) {
        await tx.adminCuratedTableMember.create({
          data: { tableId: t.id, userId: uid, pinned: false },
        });
      }
      n++;
    }
  });

  revalidateAdminMesaViews();
  return { created: n, message: `${n} mesa(s) gerada(s) com ${pool.length} participante(s) realocados.` };
}
